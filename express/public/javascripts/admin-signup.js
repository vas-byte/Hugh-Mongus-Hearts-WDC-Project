

new Vue({
  el: '#admin-signup',
  data() {
    return {
      error: null,
      useremail: '',
      is_admin: false,
      buttonPressed: false,
      accessDenied: false

    };
  },
  beforeCreate(){
    //check if the user is already authenticated
    axios.get('/auth/success/').then(response => {
      if(!response.data.is_admin){
        this.accessDenied = true;
      }
    }).catch(error => {
      if(error.response.status == 403){
        window.location.replace('/login.html');
      }
    });
  },

  methods:{
    signUp(){

      //check if the email is empty
      if(this.useremail === ''){
        this.error = 'Please enter an email address';
      } else {
        this.error = null;
      }

      //check if the button has been pressed
      if(this.buttonPressed){
        return;
      }

      this.buttonPressed = true;



      //call the server to sign up a user
      axios.post('/auth/register/email', {email: this.useremail, admin: this.is_admin}).then(response => {
        window.location.replace('/admin.html');
      }).catch(error => {

        this.error = error.response.data;
        this.buttonPressed = false;
      });

    }
  }

});
