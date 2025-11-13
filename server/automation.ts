/**
 * Automation Service for CRM
 * Handles automated task creation, reminders, and workflows
 */

import { storage } from './storage';
import { NotificationService } from './websocket';
import type { InsertActivity } from '@shared/schema';

export class AutomationService {
  private notificationService: NotificationService | null = null;
  private reminderInterval: NodeJS.Timeout | null = null;

  constructor(notificationService?: NotificationService) {
    if (notificationService) {
      this.notificationService = notificationService;
    }
  }

  /**
   * Start automated task reminder service
   */
  startReminderService() {
    // Check for due tasks every 5 minutes
    this.reminderInterval = setInterval(async () => {
      await this.checkDueTasks();
    }, 5 * 60 * 1000);

    console.log('✓ Automated reminder service started');
  }

  /**
   * Stop the reminder service
   */
  stopReminderService() {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.reminderInterval = null;
    }
  }

  /**
   * Check for tasks due within the next 24 hours
   */
  async checkDueTasks() {
    try {
      const activities = await storage.getActivities();
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const dueTasks = activities.filter(activity => {
        if (activity.type !== 'task' || !activity.dueDate) return false;

        const dueDate = new Date(activity.dueDate);
        return dueDate > now && dueDate <= tomorrow && !activity.completed;
      });

      // Send notifications for due tasks
      for (const task of dueTasks) {
        if (this.notificationService && task.ownerId) {
          this.notificationService.notifyUser(task.ownerId, {
            type: 'task_due',
            title: 'Task Due Soon',
            message: `Task "${task.subject}" is due soon`,
            userId: task.ownerId,
            timestamp: new Date(),
            priority: 'high',
            data: { taskId: task.id }
          });
        }
      }

      if (dueTasks.length > 0) {
        console.log(`Sent ${dueTasks.length} task reminders`);
      }
    } catch (error) {
      console.error('Error checking due tasks:', error);
    }
  }

  /**
   * Auto-create follow-up task when a lead is created
   */
  async createLeadFollowUpTask(leadId: string, leadName: string, ownerId: string) {
    try {
      // Create a follow-up task for 2 days from now
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 2);

      const taskData: InsertActivity = {
        type: 'task',
        subject: `Follow up on lead: ${leadName}`,
        description: 'Initial follow-up with new lead',
        leadId,
        ownerId,
        dueDate,
        priority: 'medium',
        completed: false
      };

      const task = await storage.createActivity(taskData);
      console.log(`Auto-created follow-up task for lead: ${leadName}`);

      // Send notification
      if (this.notificationService && ownerId) {
        this.notificationService.notifyUser(ownerId, {
          type: 'system_alert',
          title: 'Task Created',
          message: `Follow-up task created for lead: ${leadName}`,
          userId: ownerId,
          timestamp: new Date(),
          priority: 'low'
        });
      }

      return task;
    } catch (error) {
      console.error('Error creating follow-up task:', error);
    }
  }

  /**
   * Auto-create tasks when an opportunity moves to specific stages
   */
  async handleOpportunityStageChange(
    opportunityId: string,
    opportunityName: string,
    newStage: string,
    ownerId: string
  ) {
    try {
      const tasksByStage: Record<string, InsertActivity> = {
        'Discovery': {
          type: 'task',
          subject: `Conduct discovery call for ${opportunityName}`,
          description: 'Schedule and conduct discovery call to understand requirements',
          opportunityId,
          ownerId,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
          priority: 'high',
          completed: false
        },
        'Proposal': {
          type: 'task',
          subject: `Send proposal for ${opportunityName}`,
          description: 'Prepare and send detailed proposal',
          opportunityId,
          ownerId,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
          priority: 'high',
          completed: false
        },
        'Negotiation': {
          type: 'task',
          subject: `Negotiate terms for ${opportunityName}`,
          description: 'Schedule negotiation meeting and finalize terms',
          opportunityId,
          ownerId,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
          priority: 'critical',
          completed: false
        }
      };

      if (tasksByStage[newStage]) {
        const task = await storage.createActivity(tasksByStage[newStage]);
        console.log(`Auto-created ${newStage} task for opportunity: ${opportunityName}`);

        // Send notification
        if (this.notificationService && ownerId) {
          this.notificationService.notifyUser(ownerId, {
            type: 'system_alert',
            title: 'New Task Assigned',
            message: `Task created for ${newStage} stage: ${opportunityName}`,
            userId: ownerId,
            timestamp: new Date(),
            priority: 'medium'
          });
        }

        return task;
      }
    } catch (error) {
      console.error('Error creating stage-based task:', error);
    }
  }

  /**
   * Create reminder for overdue tasks
   */
  async sendOverdueTaskReminders() {
    try {
      const activities = await storage.getActivities();
      const now = new Date();

      const overdueTasks = activities.filter(activity => {
        if (activity.type !== 'task' || !activity.dueDate) return false;
        const dueDate = new Date(activity.dueDate);
        return dueDate < now && !activity.completed;
      });

      for (const task of overdueTasks) {
        if (this.notificationService && task.ownerId) {
          this.notificationService.notifyUser(task.ownerId, {
            type: 'task_due',
            title: 'Overdue Task',
            message: `Task "${task.subject}" is overdue`,
            userId: task.ownerId,
            timestamp: new Date(),
            priority: 'critical',
            data: { taskId: task.id }
          });
        }
      }

      if (overdueTasks.length > 0) {
        console.log(`Sent ${overdueTasks.length} overdue task reminders`);
      }
    } catch (error) {
      console.error('Error sending overdue reminders:', error);
    }
  }

  /**
   * Auto-assign leads based on round-robin or other logic
   */
  async autoAssignLead(leadId: string): Promise<string | undefined> {
    try {
      // For now, this is a placeholder
      // In a real implementation, you would:
      // 1. Get all active users
      // 2. Apply assignment logic (round-robin, availability, workload, etc.)
      // 3. Update the lead with the assigned owner

      // Example: Return demo user ID
      return 'demo-user-gareth';
    } catch (error) {
      console.error('Error auto-assigning lead:', error);
      return undefined;
    }
  }

  /**
   * Create weekly summary task
   */
  async createWeeklySummaryTask(ownerId: string) {
    try {
      const nextMonday = new Date();
      const daysUntilMonday = (8 - nextMonday.getDay()) % 7;
      nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
      nextMonday.setHours(9, 0, 0, 0);

      const taskData: InsertActivity = {
        type: 'task',
        subject: 'Weekly CRM review and planning',
        description: 'Review pipeline, update forecasts, and plan for the week',
        ownerId,
        dueDate: nextMonday,
        priority: 'medium',
        completed: false
      };

      const task = await storage.createActivity(taskData);
      console.log(`Created weekly summary task for user: ${ownerId}`);
      return task;
    } catch (error) {
      console.error('Error creating weekly summary task:', error);
    }
  }
}

// Export singleton instance
let automationService: AutomationService | null = null;

export function initializeAutomation(notificationService?: NotificationService) {
  automationService = new AutomationService(notificationService);
  automationService.startReminderService();
  return automationService;
}

export function getAutomationService() {
  return automationService;
}
