self.addEventListener('push', (event) => {
  if (!event.data) return
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title || 'MEDIKA', {
      body: data.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: data.data || {},
      vibrate: [200, 100, 200],
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const d = event.notification.data || {}
  let url = '/'
  if (d.examId) url = `/examens`
  if (d.patientId) url = `/patients/${d.patientId}`

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(self.location.origin)) {
          client.focus()
          client.navigate(url)
          return
        }
      }
      return clients.openWindow(url)
    })
  )
})
