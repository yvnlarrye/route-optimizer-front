if (!localStorage.getItem("token")) {
    window.location.href = "/sign-up";
    localStorage.clear()
}