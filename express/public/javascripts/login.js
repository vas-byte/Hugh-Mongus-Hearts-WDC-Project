

new Vue({
  el: '#login',
  data() {
    return {
      error: null,
      useremail: '',
      password: ''
    };
  },
  beforeCreate() {
    // Redirect user if already authenticated
    axios.get('/auth/success/').then(response => {
      //Redirect code goes here
      window.location.replace('/organisation-list.html');
    }).catch(error => {


    });

    //Check if any google auth errors exist
    axios.get('/auth/google/error').then(response => {

    }).catch(error => {
      //Display error message
      if(error.response.status == 401){
        if(error.response.data){
          this.error = error.response.data;
        }

      }
    });

  },
  methods: {
    // Called for every form submission
    submitForm() {
      // Make Post Request to password login endpoint
      axios.post('/auth/login/password', {
        useremail: this.useremail,
        password: this.password,
      }).then(response => {
        // Redirect user if successful
        window.location.replace('/organisation-list.html');

      }).catch(error => {

        // Otherwise display error message
        this.error = error.response.data;
      });
    }
  },
});
