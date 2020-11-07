async function updatePassword() {
    if (checkIfPwdMatch()) {
        let data = {
            email: document.getElementById('email').value,
            password: document.getElementById('pwd').value,
            randomStr: document.getElementById('pwdCode').value,
        }

        await fetch('http://localhost:3000/updatePassword', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-type': 'application/json'
            }
        }).then(res => {
            console.log(res.status);    
            if (res.status == 200)
                alert('password changed successfully');
            else
                alert('passcode dosenot match, Error Status' + res.status);

        });
    }
    else {
        alert('Passwords are not identical');
        document.getElementById('confirmPwd').focus();
    }


}

function checkIfPwdMatch() {
    let pwd = document.getElementById('pwd').value;
    let confirmPwd = document.getElementById('confirmPwd').value;
    return (pwd == confirmPwd) ? true : false;
}