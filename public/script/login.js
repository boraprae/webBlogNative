$(document).ready(function () {

    $('#btnSignIn').click(function () {
        $("#signInModal").modal("show");
        $("#txtUsername").val("");
        $("#txtPassword").val("");
    });

    //Just Sign In
    $('#btnSignInSubmit').click(function () {
        $("#signInModal").modal("hide");
        let username = $("#txtUsername").val();
        let password = $("#txtPassword").val();

        $.ajax({
            type: "POST",
            url: "/login",
            data: { username, password },
            success: function (response) {
                //window.location.reload();
                //! ==== keep token to local storage ====
                window.localStorage.token = response.token;
                alert('success');
                // Swal.fire({
                //     icon: 'success',
                //     title: 'สำเร็จแล้ว',
                //     text: "5555555",
                // });
                window.location.replace(response.url);
            }, error: (xhr) => {
                alert(xhr.responseText);
                // Swal.fire({
                //     icon: 'error',
                //     title: 'ขออภัย',
                //     text: xhr.responseText,
                // });
            }
        });
    });
});


