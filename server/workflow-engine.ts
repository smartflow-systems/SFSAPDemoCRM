import type { Workflow, InsertWorkflowExecution } from '../shared/schema';
import { storage } from './storage';
import { usageMeteringService } from './usage-metering-service';

interface WorkflowAction {
  type: 'send_email' | 'create_task' | 'update_field' | 'send_notification' | 'webhook' | 'assign_owner';
  params: Record<string, any>;
}

interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export class WorkflowEngine {
  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflow: Workflow,
    entity: any,
    entityType: 'lead' | 'opportunity' | 'account' | 'contact'
  ): Promise<void> {
    const startTime = Date.now();

    const execution: InsertWorkflowExecution = {
      tenantId: workflow.tenantId,
      workflowId: workflow.id,
      entityId: entity.id,
      status: 'running',
    };

    try {
      // Record usage
      await usageMeteringService.recordAutomationRun(workflow.tenantId);

      // Check conditions
      if (workflow.triggerConditions) {
        const conditions = workflow.triggerConditions as WorkflowCondition[];
        const conditionsMet = this.evaluateConditions(entity, conditions);

        if (!conditionsMet) {
          console.log(`Workflow ${workflow.id} conditions not met for entity ${entity.id}`);
          return;
        }
      }

      // Execute actions
      const actions = workflow.actions as WorkflowAction[];

      for (const action of actions) {
        await this.executeAction(action, entity, workflow.tenantId);
      }

      // Mark execution as successful
      execution.status = 'success';
      execution.executionTime = Date.now() - startTime;

      console.log(`✓ Workflow ${workflow.name} executed successfully for ${entityType} ${entity.id}`);

    } catch (error: any) {
      console.error(`Workflow execution failed:`, error);
      execution.status = 'failed';
      execution.error = error.message;
      execution.executionTime = Date.now() - startTime;
    }

    // Log execution (would be implemented in storage)
    // await storage.createWorkflowExecution(execution);
  }

  /**
   * Evaluate workflow conditions
   */
  private evaluateConditions(entity: any, conditions: WorkflowCondition[]): boolean {
    return conditions.every(condition => {
      const fieldValue = this.getNestedValue(entity, condition.field);

      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'not_equals':
          return fieldValue !== condition.value;
        case 'contains':
          return String(fieldValue).includes(String(condition.value));
        case 'greater_than':
          return Number(fieldValue) > Number(condition.value);
        case 'less_than':
          return Number(fieldValue) < Number(condition.value);
        default:
          return false;
      }
    });
  }

  /**
   * Execute a single workflow action
   */
  private async executeAction(
    action: WorkflowAction,
    entity: any,
    tenantId: string
  ): Promise<void> {
    switch (action.type) {
      case 'send_email':
        await this.sendEmail(action.params, entity);
        break;

      case 'create_task':
        await this.createTask(action.params, entity, tenantId);
        break;

      case 'update_field':
        await this.updateField(action.params, entity);
        break;

      case 'send_notification':
        await this.sendNotification(action.params, entity);
        break;

      case 'webhook':
        await this.triggerWebhook(action.params, entity);
        break;

      case 'assign_owner':
        await this.assignOwner(action.params, entity);
        break;

      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Send email action
   */
  private async sendEmail(params: any, entity: any): Promise<void> {
    console.log(`Sending email: ${params.subject} to ${params.to}`);

    // Would integrate with email service (SendGrid, AWS SES, etc.)
    // For now, just log
    console.log(`
======================================
EMAIL ACTION
======================================
To: ${params.to}
Subject: ${params.subject}
Body: ${params.body}
Entity: ${entity.id}
======================================
    `);
  }

  /**
   * Create task action
   */
  private async createTask(params: any, entity: any, tenantId: string): Promise<void> {
    const taskData = {
      tenantId,
      type: 'task',
      subject: params.subject || `Follow up: ${entity.name || entity.firstName}`,
      description: params.description,
      leadId: entity.type === 'lead' ? entity.id : undefined,
      opportunityId: entity.type === 'opportunity' ? entity.id : undefined,
      ownerId: params.ownerId || entity.ownerId,
      dueDate: this.calculateDueDate(params.dueInDays || 1),
      completed: false,
      priority: params.priority || 'medium',
    };

    await storage.createActivity(taskData);
    console.log(`✓ Created task: ${taskData.subject}`);
  }

  /**
   * Update field action
   */
  private async updateField(params: any, entity: any): Promise<void> {
    console.log(`Updating field ${params.field} to ${params.value} for entity ${entity.id}`);

    // Would update the entity in storage
    // Implementation depends on entity type
  }

  /**
   * Send notification action
   */
  private async sendNotification(params: any, entity: any): Promise<void> {
    console.log(`Sending notification: ${params.message}`);

    // Would integrate with notification service (WebSocket, push notifications, etc.)
  }

  /**
   * Trigger webhook action
   */
  private async triggerWebhook(params: any, entity: any): Promise<void> {
    console.log(`Triggering webhook: ${params.url}`);

    try {
      const response = await fetch(params.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: params.event,
          entity,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        console.error(`Webhook failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Webhook error:', error);
    }
  }

  /**
   * Assign owner action
   */
  private async assignOwner(params: any, entity: any): Promise<void> {
    console.log(`Assigning owner ${params.ownerId} to entity ${entity.id}`);

    // Would update the entity owner in storage
  }

  /**
   * Trigger workflows based on event
   */
  async triggerWorkflows(
    tenantId: string,
    triggerType: string,
    entity: any,
    entityType: 'lead' | 'opportunity' | 'account' | 'contact'
  ): Promise<void> {
    // Get active workflows for this trigger type
    // const workflows = await storage.getWorkflowsByTrigger(tenantId, triggerType);

    // For now, simulate
    console.log(`Checking workflows for trigger: ${triggerType}`);

    // Execute each matching workflow
    // for (const workflow of workflows) {
    //   if (workflow.isActive) {
    //     await this.executeWorkflow(workflow, entity, entityType);
    //   }
    // }
  }

  /**
   * Helper: Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Helper: Calculate due date
   */
  private calculateDueDate(daysFromNow: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date;
  }
}

export const workflowEngine = new WorkflowEngine();
