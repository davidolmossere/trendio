const draggableItems = document.querySelectorAll('.draggable')
const container = document.getElementById('draggable-list')
const firstPos = +document.querySelectorAll('.pos-label')[0].innerText

draggableItems.forEach(draggable => {
  draggable.addEventListener('dragstart', () => {
    draggable.classList.add('dragging')
  })

  draggable.addEventListener('dragend', () => {
    draggable.classList.remove('dragging')
  })

  draggable.addEventListener('drop', () => {
    const itemsPos = document.querySelectorAll('.pos-label')
    itemsPos.forEach((itemPos, index) => {
      itemPos.innerText = firstPos + index
    })
    
    jsonObj = [];

    const dataItems = document.querySelectorAll('[data-index]')
    dataItems.forEach((dataItem, i) => {
      item = {}
      item ['index'] = dataItem.dataset.index;
      item ['newPos'] = firstPos+i;
      jsonObj.push(item);
    })
    
    let baseurl = 'http://localhost:3000/videos/shuffle';
    let req = new Request(baseurl, {
      method: 'POST',
      body: JSON.stringify(jsonObj),
      headers: {    
        "Content-Type": "application/json"
      }
    });
    
    fetch(req)
      .then(response => response.json())
      .catch((err) => console.error);

  })
})

container.addEventListener('dragover', e => {
  e.preventDefault()
  const afterElement = getDragAfterElement(container, e.clientY)
  const draggable = document.querySelector('.dragging')
  if (afterElement == null) {
    container.appendChild(draggable)
  } else {
    container.insertBefore(draggable, afterElement)
  }  
})

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')]

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect()
    const offset = y - box.top - box.height / 2
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child }
    } else {
      return closest
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element
}