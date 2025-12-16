async function displayNotes(data) {
  const div = document.getElementById("output")
  let html = ''
  for (const [index, note] of data.entries()) {
    console.log(index, note)
    html += `<br>`
    html += `<h3>Note ${index + 1}</h3>`
    html += `<ul>Note name: ${note.name}</ul>`
    html += `<ul>Note desc: ${note.description}</ul>`
    html += `<button onclick="RemoveItem('note', ${note.id})">Delete note</button>`
    html += `<button onclick="UpdateNote(${note.id})">Update note</button> <br><br>` 
  }
  div.innerHTML = html
}

async function displayTasks(data) {
  const div = document.getElementById("task-output")
  let html = ''
  for (const [index, task] of data.tasks.entries()) {
    html += `<br>`
    html += `<h3>Task ${index + 1}<h3>`
    html += `<ul>Task name: ${task.name}</ul>`
    html += `<ul>Task desc: ${task.description}</ul>`
    html += `<ul>Task status: ${task.status}</ul>`
    html += `<button onclick="RemoveItem('task', ${task.id})">Delete task</button>`
    html += `<button onclick="UpdateTask(${task.id})">Update task</button> <br><br>`
  }
  div.innerHTML = html
}

async function fetchData(table) {
  try {
    const res = await fetch('/profile2')
    const data = await res.json()
    console.log(data)
    window[`display${table}`](data)
  } catch (err) {
    console.log(err)
  }
}


async function AddItem(item) {
  const name = document.getElementById("note-name").value
  const description = document.getElementById("note-description").value

  const payload = { name, description }
  try {
    await fetch(`/api/create/${item}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(payload)
  })
  } catch (err) {
    console.log(err)
  }
}

async function RemoveItem(type, id) {
  try {
    await fetch(`/api/delete/${type}/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
  } catch (err) {
    console.log(err)
  }
}