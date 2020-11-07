

async function loginUser() {
    let data = {
        email: document.getElementById('username').value,
        password: document.getElementById('password').value,
    }
    await fetch('http://localhost:3000/login', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-type': 'application/json',
        }
    }).then(res => {
        console.log(res);
        if (res.status == 200) {
            alert('login success');
        }
        else {
            alert('login failed. Status' + res.status);
        }
    })
}

async function sendMail() {
    let userEmail = document.getElementById('username');
    if (userEmail.value === '') {
        alert('Please enter email');
        userEmail.focus();
    }
    else {
        let data = {
            email: document.getElementById('username').value,
        }
        await fetch('http://localhost:3000/sendMail', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-type': 'application/json'
            }
        }).then(res => {
            if (res.status == 200) {
                alert('please check your mail to reset password.')
            }
            else if (res.status == 401)
                alert('User does not exist !! Please Register')
            else {
                alert('Error in sending mail , Error Status' + res.status);
            }
        })
    }
}

