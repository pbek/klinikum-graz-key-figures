<template>
    <v-container fluid fill-height class="loginOverlay">
        <v-layout flex align-center justify-center>
            <v-flex xs12 sm4 elevation-6>
                <v-toolbar class="pt-5 darken-4">
                    <v-toolbar-title class="white--text"><h4>Please login</h4></v-toolbar-title>
                </v-toolbar>
                <v-card>
                <v-card-text class="pt-4">
                    <div>
                        <v-form v-model="valid" ref="form">
                        <v-text-field
                            label="Enter your e-mail address"
                            v-model="email"
                            :rules="emailRules"
                            required
                            v-on:keyup.enter = "login"
                        ></v-text-field>
                        <v-text-field
                            label="Enter your password"
                            v-model="password"
                            min="6"
                            :type="'password'"
                            :rules="passwordRules"
                            counter
                            required
                            v-on:keyup.enter = "login"
                        ></v-text-field>
                        <v-layout justify-space-between>
                            <v-btn @click="login" :class=" { 'blue darken-4 white--text' : valid, disabled: !valid }">Login</v-btn>
                        </v-layout>
                        </v-form>
                    </div>
                </v-card-text>
                </v-card>
            </v-flex>
        </v-layout>
        <v-layout flex align-center justify-center v-if="showError">
            <v-alert type="error" dismissible v-model="showError">{{error}}</v-alert>
        </v-layout>
    </v-container>
    <!-- <section id="firebaseui-auth-container">Login</section> -->
</template>

<script>
import firebase from "firebase";
// import firebaseui from "firebaseui";
// import "firebaseui/dist/firebaseui.css";

export default {
    name: "Login",
    mounted() {
        // firebase.auth().signInWithEmailAndPassword(this.email, this.password);
        // var ui = new firebaseui.auth.AuthUI(firebase.auth());
        // var uiConfig = {
        //     signInSuccessUrl: "/",
        //     signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID]
        // };
        // ui.start("#firebaseui-auth-container", uiConfig);
        // console.log(uiConfig);
        // console.log(firebase.auth().currentUser);

        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(() => {
                console.log("currentUser: ", firebase.auth().currentUser);
            })
            .catch(function(error) {
                // Handle Errors here.
                console.error(error.message);
            });


        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                console.log("user changed: ", user);
            } else {
                // No user is signed in.
            }
        });
    },
    data () {
        return {
            valid: false,
            password: '',
            passwordRules: [
                (v) => !!v || 'Password is required',
            ],
            email: '',
            emailRules: [
                (v) => !!v || 'E-mail is required',
                (v) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'E-mail must be valid'
            ],
            showError: false,
            error: '',
        }
    },
    methods: {
        clear () {
            this.$refs.form.reset()
        },
        login() {
            if (!this.$refs.form.validate()) {
                return;
            }

            const that = this;

            // }
            // firebase.auth().signInWithCustomToken("AIzaSyBTvL644E8wvtAFm3Y0jIGr-TRr_Ocvno0")
            //         .then(() => {
            //             console.log(firebase.auth().currentUser);
            //         }).catch((e) => {
            //             console.error(e.message);
            //         });

            firebase.auth().signInWithEmailAndPassword(this.email, this.password)
                .then(() => {
                    console.log(firebase.auth().currentUser);
                }).catch((e) => {
                    that.error = e.message;
                    that.showError = true;
                    console.error(e.message);
                });

            // firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            //     .then(() => {
            //         firebase.auth().signInWithEmailAndPassword(this.email, this.password)
            //             .then(() => {
            //                 console.log(firebase.auth().currentUser);
            //             }).catch((e) => {
            //                 console.error(e.message);
            //             });
            //     })
            //     .catch(function(error) {
            //         // Handle Errors here.
            //         console.error(error.message);
            //     });
        }
    }
}
</script>
