# SFSAPDemoCRM — Claude Context

Role: CRM demo platform for SmartFlow Systems sales demos.
Repo: https://github.com/smartflow-systems/SFSAPDemoCRM
Local: /home/garet/SFS/SFSAPDemoCRM

## Purpose
Customer relationship management demo — used for client demos,
lead flow testing, and onboarding walkthroughs.

## Key Features
- Lead management and pipeline tracking
- Demo-ready sample data
- Client onboarding flows
- Standard SFS CI/CD

## Stack
Node.js, Express, brown/black/gold theme

## Key Files
- [src/leads/] — lead management
- [src/demo/] — demo data and flows
- [.github/workflows/ci.yml] — CI pipeline

## Health Check
GET /health → {"ok":true}

## Common Commands
npm run dev    → Start dev server (port 5000)
npm run build  → Build
npm run health → Health check

## Secrets
SFS_PAT, REPLIT_TOKEN

## Notes
This is a demo repo — keep sample data clean and professional.
Do not put real client data here.
