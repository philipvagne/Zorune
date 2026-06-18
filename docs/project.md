# Project

## Name

Zorune

## Purpose

Zorune is a calm workspace for projects, tasks, notes, and team organization.

The goal is to help small teams or individuals reduce operational chaos without turning the product into a heavy management system.

## Core Principle

Every feature must reduce chaos faster than it adds complexity.

## Product Direction

Zorune should feel:

* calm
* minimal
* structured
* useful
* professional
* easy to understand

## Current Focus

Phase A — Complete Teams Workspace.

Current priorities:

1. Teams Members tab
2. Teams Projects tab
3. Teams Settings tab

Teams Workspace is the reference implementation for future workspace surfaces.

## Completed Foundation

* Authentication
* Organizations / Teams
* Projects
* Tasks
* Notes
* Notifications V1
* Recent Work V1
* Workspace architecture refactor
* Workspace primitive ownership cleanup

## Current Architecture Ownership

* `workspace-*` = shared workspace primitives
* `organization-*` = Teams Workspace
* `project-*` = Project Workspace
* `task-*` = Task surfaces
