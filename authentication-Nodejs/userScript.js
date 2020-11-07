

async function registerUser() {
    let fname = document.getElementById('fname').value;
    let lname = document.getElementById('lname').value;
    let data = {
        fullname: fname + lname,
        email: document.getElementById('userEmail').value,
        password: document.getElementById('pwd').value,
    }
    await fetch('http://localhost:3000/register', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-type': 'application/json'
        }
    }).then(res => {
        if (res.status == 400)
            alert('User already exists!!Please Sign in');
        else if (res.status == 200)
            alert('User Registered successfully!!')
    })


}