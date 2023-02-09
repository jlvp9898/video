var generate_button = document.querySelector(".generate_new_video");

 generate_button.addEventListener("click", async function(){

    const response = await fetch('api/new_video');
    // waits until the request completes...
    const data = await response.json();
    window.location.href="/edit/"+data.token;
});
    
