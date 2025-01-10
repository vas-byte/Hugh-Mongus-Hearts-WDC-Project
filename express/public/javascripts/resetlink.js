new Vue({
    el: '#resetlink',
    data: {
      isLoggedIn: null,
      isAdmin: null,
      email: '',
      message: '',
      sending: false
    },

    methods:{

        // Called for every form submission
        resetPassword(){
            //check if already sending
            if(this.sending){
                return;
            }

            //set sending to true
            this.sending = true;

            axios.post('/auth/email/reset', {
            email: this.email
            }).then(response => {
                this.sending = false;
                this.message = "A link should be emailed to the address provided if it exists in the system.";
            });
        },

        goToLogin(){
            window.location.replace('/login.html');
        }
    },
});