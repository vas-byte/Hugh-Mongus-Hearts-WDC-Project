new Vue({
    el: '#resetpassword',
    data() {
      return {
        error: null,
        password: '',
        passwordConf: '',
        tokenValid: false,
        passwordsMatch: true,

      };
    },
    beforeCreate() {

      //get token from URL
      var urlParams = new URLSearchParams(window.location.search);
      var token = urlParams.get('token');

      //Make get request to verify token
      axios.get(`/auth/verify/${token}`).then(response => {

        this.tokenValid = true;

    }).catch(error => {

      //if 403 error, redirect to login
      if(error.response.status == 403){
        this.tokenValid = false;
      }

    });

    },

    methods: {

      // Called for password reset form submission
      submitForm() {

          //check if passwords match otherwise return
          if(!this.passwordsMatch){
            return;
          }

          //get token from URL
          var urlParams = new URLSearchParams(window.location.search);
          var token = urlParams.get('token');


          // Make Post Request to password reset endpoint
          axios.post(`/auth/reset/${token}`, {
            password: this.password,
          }).then(response => {

            // Redirect user if successful
            window.location.replace('/login.html');

          }).catch(error => {
            // Otherwise display error message
            this.error = error.response.data;
          });

      },

      confirmPassword(){

        //Check if passwords match
        if (this.passwordConf == this.password){
          this.error = null;
          this.passwordsMatch = true;
          return true;
        }

        this.error = "Passwords Don't Match";
        this.passwordsMatch = false;
      },

      //redirects user to login
      invalidButton(){
        window.location.replace('/login.html');
      }
    },

  });
