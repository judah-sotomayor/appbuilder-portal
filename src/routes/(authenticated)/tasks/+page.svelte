<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import { getIcon } from '$lib/icons/productDefinitionIcon';
  import { m } from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';
  import TaskComment from '$lib/products/components/TaskComment.svelte';
  import { userTasksSSE } from '$lib/stores';
  import {
    buildTaskRows,
    getTaskHref,
    getUserDataTaskStatus,
    type FrontendTaskRow
  } from '$lib/tasks/list';
  import type { UserDataTaskListItem } from '$lib/tasks/types';
  import { getRelativeTime, getTimeDateString } from '$lib/utils/time';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const workflowTasks = $derived($userTasksSSE ?? data.userTasks);
  const taskRows = $derived(buildTaskRows(workflowTasks, data.userDataTasks));

  const dateUpdated = $derived(getRelativeTime(taskRows.map((task) => task.updatedAt)));

  function taskHref(task: FrontendTaskRow) {
    return localizeHref(getTaskHref(task));
  }

  function userDataTaskStatusLabel(task: UserDataTaskListItem) {
    switch (getUserDataTaskStatus(task)) {
      case 'completed':
        return m.userDataTasks_statusCompleted();
      case 'confirmed':
        return m.userDataTasks_statusConfirmed();
      default:
        return m.userDataTasks_statusPending();
    }
  }

  function userDataTaskBadgeClass(task: UserDataTaskListItem) {
    switch (getUserDataTaskStatus(task)) {
      case 'completed':
        return 'badge-success';
      case 'confirmed':
        return 'badge-secondary';
      default:
        return 'badge-warning';
    }
  }
</script>

<div class="w-full">
  <h1>{m.tasks_title()}</h1>
  <div class="m-4 relative mt-0">
    {#if taskRows.length > 0}
      <table class="w-full table-fixed sm:hidden">
        <thead>
          <tr class="border-b-2 text-left">
            <th class="w-1/4">{m.tasks_product()}</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each taskRows as row, i}
            {#if row.kind === 'workflow'}
              <tr class="cursor-pointer no-border" onclick={() => goto(taskHref(row))}>
                <td colspan="3">
                  <span class="flex items-center">
                    <IconContainer
                      icon={getIcon(row.task.Product.ProductDefinition.Name ?? '')}
                      width={38}
                    />
                    <span>
                      {row.task.Product.ProductDefinition.Name}
                    </span>
                  </span>
                </td>
              </tr>
              <tr class="no-border">
                <th class="text-left pl-2">{m.tasks_project()}</th>
                <td colspan="2">
                  <a class="link" href={localizeHref(`/projects/${row.task.Product.ProjectId}`)}>
                    {row.task.Product.Project.Name}
                  </a>
                </td>
              </tr>
              <tr class="cursor-pointer" class:no-border={row.task.Comment}>
                <td colspan="2" class="pl-2" onclick={() => goto(taskHref(row))}>
                  <span
                    class="rounded-xl h-auto badge badge-secondary uppercase font-bold [top:-5px] relative mt-2 text-center"
                  >
                    {row.task.Status}
                  </span>
                </td>
                <td>
                  <Tooltip tip={getTimeDateString(row.updatedAt)}>
                    {$dateUpdated[i]}
                  </Tooltip>
                </td>
              </tr>
              {#if row.task.Comment}
                <tr>
                  <td class="p-0" colspan="3">
                    <TaskComment comment={row.task.Comment} />
                  </td>
                </tr>
              {/if}
            {:else}
              <tr class="cursor-pointer no-border" onclick={() => goto(taskHref(row))}>
                <td colspan="3">
                  <span class="flex items-center">
                    <IconContainer icon="mdi:account-remove-outline" width={38} />
                    <span>{m.userDataTasks_taskTypeRequest()}</span>
                  </span>
                </td>
              </tr>
              <tr class="no-border">
                <th class="text-left pl-2">{m.userDataTasks_email()}</th>
                <td colspan="2">{row.task.email}</td>
              </tr>
              <tr class="cursor-pointer">
                <td colspan="2" class="pl-2" onclick={() => goto(taskHref(row))}>
                  <span
                    class={`rounded-xl h-auto badge uppercase font-bold [top:-5px] relative mt-2 text-center ${userDataTaskBadgeClass(
                      row.task
                    )}`}
                  >
                    {userDataTaskStatusLabel(row.task)}
                  </span>
                  <div class="mt-1 text-sm">
                    {m.userDataTasks_rowSummary({ email: row.task.email })}
                  </div>
                </td>
                <td>
                  <Tooltip tip={getTimeDateString(row.updatedAt)}>
                    {$dateUpdated[i]}
                  </Tooltip>
                </td>
              </tr>
            {/if}
          {/each}
        </tbody>
      </table>
      <table class="w-full hidden sm:table">
        <thead>
          <tr class="border-b-2 text-left">
            <th>{m.tasks_product()}</th>
            <th>{m.tasks_project()}</th>
            <th>{m.tasks_waitTime()}</th>
          </tr>
        </thead>
        <tbody>
          {#each taskRows as row, i}
            {#if row.kind === 'workflow'}
              <tr class="cursor-pointer" onclick={() => goto(taskHref(row))} class:no-border={row.task.Comment}>
                <td>
                  <span class="flex items-center">
                    <IconContainer
                      icon={getIcon(row.task.Product.ProductDefinition.Name ?? '')}
                      width={38}
                    />
                    <span>
                      {row.task.Product.ProductDefinition.Name}
                    </span>
                  </span>
                  <span
                    class="rounded-xl h-auto badge badge-secondary uppercase font-bold ml-10 [top:-5px] relative mt-2 text-center"
                  >
                    {row.task.Status}
                  </span>
                </td>
                <td>
                  <a class="link" href={localizeHref(`/projects/${row.task.Product.ProjectId}`)}>
                    {row.task.Product.Project.Name}
                  </a>
                </td>
                <td>
                  <Tooltip tip={getTimeDateString(row.updatedAt)}>
                    {$dateUpdated[i]}
                  </Tooltip>
                </td>
              </tr>
              {#if row.task.Comment}
                <tr>
                  <td class="pl-7 pt-0" colspan="3">
                    <TaskComment comment={row.task.Comment} />
                  </td>
                </tr>
              {/if}
            {:else}
              <tr class="cursor-pointer" onclick={() => goto(taskHref(row))}>
                <td>
                  <span class="flex items-center">
                    <IconContainer icon="mdi:account-remove-outline" width={38} />
                    <span>{m.userDataTasks_taskTypeRequest()}</span>
                  </span>
                  <span
                    class={`rounded-xl h-auto badge uppercase font-bold ml-10 [top:-5px] relative mt-2 text-center ${userDataTaskBadgeClass(
                      row.task
                    )}`}
                  >
                    {userDataTaskStatusLabel(row.task)}
                  </span>
                </td>
                <td>{m.userDataTasks_rowSummary({ email: row.task.email })}</td>
                <td>
                  <Tooltip tip={getTimeDateString(row.updatedAt)}>
                    {$dateUpdated[i]}
                  </Tooltip>
                </td>
              </tr>
            {/if}
          {/each}
        </tbody>
      </table>
    {:else}
      <div class="pl-4">
        <h3 class="p-0">{m.tasks_noTasksTitle()}</h3>
        <span>{m.tasks_noTasksDescription()}</span>
      </div>
    {/if}
  </div>
</div>

<style>
  thead th {
    padding: 0.75rem;
  }
  tbody td,
  th {
    padding-top: 0;
    padding-bottom: 1rem;
  }
  :where(thead tr, tbody tr:not(:last-child)) {
    @supports (color: color-mix(in lab, red, red)) {
      /* Copied from DaisyUI source. Modified opacity */
      border-bottom: var(--border) solid color-mix(in oklch, var(--color-base-content) 25%, #0000);
    }
  }
  .no-border {
    border: none;
  }
</style>
