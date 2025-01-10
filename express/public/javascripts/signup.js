const router = new VueRouter({});

new Vue({
    el: '#signup',
    data() {
      return {
        error: null,
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        confPassword: '',
        passwordsMatch: true

      };
    },
    beforeCreate() {

      // Redirect user if already authenticated
      axios.get('/auth/success/').then(response => {
        //Redirect code goes here
        window.location.replace('/organisation-list.html');
      }).catch(error => {

      });
    },
    methods: {
      // Called for every form submission
      submitForm() {

        //check if passwords match otherwise return
        if(!this.passwordsMatch){
          return;
        }

        var urlParams = new URLSearchParams(window.location.search);
        var token = urlParams.get('adminToken');

        // Make Post Request to password login endpoint
        axios.post('/auth/register', {
          email: this.email,
          password: this.password,
          first_name: this.firstname,
          last_name: this.lastname,
          token: token
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
        if (this.confPassword == this.password){
          this.error = null;
          this.passwordsMatch = true;
          return true;
        }

        this.error = "Passwords Don't Match";
        this.passwordsMatch = false;
      }
    },

  });
