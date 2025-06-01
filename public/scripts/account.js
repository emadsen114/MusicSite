
document.querySelector("form").addEventListener("submit",validateAccount);


function validateAccount(e){
    let fName = document.querySelector("input[name=firstName]").value;
    let isValid = true;

    if (fName.length < 4) {
       alert("The first Name should have at least 3 characters");
       isValid = false; //prevents the form submission
    }

    if (!isValid){
        e.preventDefault();
    }
    let eValid = validateUsername(e);
    let uValid = validateEmail(e);

}

function validateEmail(e){
    let emailValid = document.querySelector("input[name=email]").value;

    
}