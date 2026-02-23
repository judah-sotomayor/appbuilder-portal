<script lang="ts">
  import type { ActionData, PageData } from './$types';
  import { enhance } from '$app/forms';
  import { m } from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';
  import { getUserDataTaskStatus } from '$lib/tasks/list';
  import { getTimeDateString } from '$lib/utils/time';

  interface Props {
    data: PageData;
    form?: ActionData;
  }

  let { data, form }: Props = $props();

  let submitting = $state(false);
  type ActionErrorReason = 'forbidden' | 'not-found' | 'unavailable';

  const status = $derived(getUserDataTaskStatus(data.task));

  const statusLabel = $derived.by(() => {
    switch (status) {
      case 'completed':
        return m.userDataTasks_statusCompleted();
      case 'confirmed':
        return m.userDataTasks_statusConfirmed();
      default:
        return m.userDataTasks_statusPending();
    }
  });

  const statusBadgeClass = $derived.by(() => {
    switch (status) {
      case 'completed':
        return 'badge-success';
      case 'confirmed':
        return 'badge-secondary';
      default:
        return 'badge-warning';
    }
  });

  const canMarkComplete = $derived(status !== 'completed');
  const actionReason = $derived.by(() => {
    if (form && typeof form === 'object' && 'reason' in form) {
      return form.reason as ActionErrorReason;
    }
    return undefined;
  });

  function formatDate(date: Date | string | null) {
    return getTimeDateString(date);
  }

  function actionErrorMessage(reason?: ActionErrorReason) {
    switch (reason) {
      case 'forbidden':
        return m.userDataTasks_errorForbidden();
      case 'not-found':
        return m.userDataTasks_errorNotFound();
      default:
        return m.userDataTasks_errorUnavailable();
    }
  }
</script>

<div class="p-5">
  <div class="breadcrumbs">
    <ul>
      <li><a class="link" href={localizeHref('/tasks')}>{m.sidebar_myTasks({ count: 0 })}</a></li>
      <li>{m.userDataTasks_detailTitle()}</li>
    </ul>
  </div>

  <div class="mt-4 flex flex-wrap items-center gap-3">
    <h1 class="m-0">{m.userDataTasks_detailTitle()}</h1>
    <span class={`badge uppercase font-bold ${statusBadgeClass}`}>{statusLabel}</span>
  </div>

  <p class="mt-3">{m.userDataTasks_detailRequestMessage({ email: data.task.email })}</p>

  {#if form?.ok === false}
    <div class="alert alert-error mt-4">
      <span>{actionErrorMessage(actionReason)}</span>
    </div>
  {/if}

  <div class="mt-4 grid gap-3 md:grid-cols-2">
    <label class="form-control">
      <span class="label-text font-semibold">{m.userDataTasks_requestId()}</span>
      <input class="input input-bordered w-full" readonly value={data.task.requestId} />
    </label>
    <label class="form-control">
      <span class="label-text font-semibold">{m.userDataTasks_email()}</span>
      <input class="input input-bordered w-full" readonly value={data.task.email} />
    </label>
    <label class="form-control">
      <span class="label-text font-semibold">{m.userDataTasks_dateCreated()}</span>
      <input class="input input-bordered w-full" readonly value={formatDate(data.task.dateCreated)} />
    </label>
    <label class="form-control">
      <span class="label-text font-semibold">{m.userDataTasks_dateUpdated()}</span>
      <input class="input input-bordered w-full" readonly value={formatDate(data.task.dateUpdated)} />
    </label>
    <label class="form-control">
      <span class="label-text font-semibold">{m.userDataTasks_dateConfirmed()}</span>
      <input
        class="input input-bordered w-full"
        readonly
        value={formatDate(data.task.dateConfirmed)}
      />
    </label>
    <label class="form-control">
      <span class="label-text font-semibold">{m.userDataTasks_dateCompleted()}</span>
      <input
        class="input input-bordered w-full"
        readonly
        value={formatDate(data.task.dateCompleted)}
      />
    </label>
  </div>

  {#if canMarkComplete}
    <form
      class="mt-6"
      method="POST"
      use:enhance={() => {
        submitting = true;
        return async ({ update }) => {
          submitting = false;
          await update();
        };
      }}
    >
      <button type="submit" class="btn btn-primary" disabled={submitting}>
        {submitting ? m.userDataTasks_markCompleteSubmitting() : m.userDataTasks_markComplete()}
      </button>
    </form>
  {:else}
    <div class="alert alert-success mt-6">
      <span>{m.userDataTasks_alreadyCompleted()}</span>
    </div>
  {/if}
</div>
