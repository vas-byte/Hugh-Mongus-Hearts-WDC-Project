
var vueinst = new Vue({
    el: '#menu',
    data: {
      isLoggedIn: null,
      isAdmin: null
    },

    beforeCreate() {

      // Redirect user if already authenticated
      axios.get('/auth/success/').then(response => {
        //Set isLoggedIn to true
        this.isLoggedIn = true;
        this.isAdmin = response.data.is_admin;
      }).catch(error => {

        //Set isLoggedIn to false
        this.isLoggedIn = false;
        this.isAdmin = false;
      });

    }
});

