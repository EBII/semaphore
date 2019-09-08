import { store } from '../store'
import { scheduleIdleTask } from '../../_utils/scheduleIdleTask'
import { CLEANUP_DELAY, CLEANUP_TIME_AGO } from '../../_static/database'

function doCleanup () {
  // Periodically clean up drafts in localStorage, so they don't grow without bound.
  // Only do this for replies, so not for the home timeline or the compose modal.
  const now = Date.now()
  let changeCount = 0
  const { composeData } = store.get()
  for (const instanceComposeData of Object.values(composeData)) {
    for (const [realm, timelineComposeData] of Object.entries(instanceComposeData)) {
      if (realm === 'home' || realm === 'dialog') {
        continue
      }
      const ts = timelineComposeData.ts || 0 // if no timestamp set, just assume it's very old (migration behavior)
      if (now - ts > CLEANUP_TIME_AGO) {
        delete instanceComposeData[realm]
        changeCount++
      }
    }
  }
  console.log('deleted', changeCount, 'old drafts')
  if (changeCount) {
    store.set({ composeData })
  }
}

export function cleanup () {
  setInterval(() => scheduleIdleTask(doCleanup), CLEANUP_DELAY)
}
