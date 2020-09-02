<template>
    <section id="firebaseui-auth-container">Login</section>
</template>

<script>
import firebase from "firebase";
import firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";

export default {
    name: "Login",
    mounted() {
        var ui = new firebaseui.auth.AuthUI(firebase.auth());
        var uiConfig = {
            signInSuccessUrl: "/profile",
            signInOptions: [firebase.auth.FacebookAuthProvider.PROVIDER_ID]
        };
        ui.start("#firebaseui-auth-container", uiConfig);
        console.log(uiConfig);
    }
}
</script>
