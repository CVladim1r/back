document.getElementById('getDataBtn').addEventListener('click', () => {
    fetch('http://localhost:8080/api/data')
        .then(response => response.json())
        .then(data => {
            document.getElementById('response').textContent = JSON.stringify(data);
        })
        .catch(error => console.error('Error:', error));
});

document.getElementById('postDataBtn').addEventListener('click', () => {
    fetch('http://localhost:8080/api/data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: 'value' }),
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('response').textContent = JSON.stringify(data);
        })
        .catch(error => console.error('Error:', error));
});

const socket = io('http://localhost:8080');
socket.on('message', (data) => {
    console.log(data);
});
