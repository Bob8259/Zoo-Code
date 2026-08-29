# Changelog

All notable changes to this project will be documented in this file.

## 3.54.14

- Fixed queued messages disappearing during chat history condensation; queued messages are now sent after condensation completes.

## 3.54.13

- Fixed queued messages disappearing when a subtask was active; messages now follow the delegation chain and are delivered after the main task finishes.

## 3.54.12

- Denied `ask_followup_question` in delegated subtasks; sub agents are guided to complete work directly and return via `task_completion`.

## 3.54.11

- Fixed the task completion notification not appearing on Windows; it now uses a real OS notification instead of an in-editor message, so it is visible when the editor is unfocused.

## 3.54.10

- Added an optional system notification when the current task finishes, enabled by default.

## 3.54.9

- Denied `switch_mode` in delegated subtasks; sub agents are guided to return via `task_completion` instead.

## 3.54.8

- Fixed message queue button not being visible when the Agent is running a command (`command_output` state).

## 3.54.7

- Added the `/condense` chat command for manually condensing the current conversation.
- Delayed queued messages until the current task reaches completion.

## 3.54.4

Local development build.

## 3.54.3

Local development build.
