new Vue({
    el: '#admin',

    //Define the properties of the dialog component
    props: {
      message: {
        type: String,
        default: 'Are you sure?'
      },
      visible: {
        type: Boolean,
        default: false
      }
    },

    data() {
      return {
        accessDenied: null,
        users: [],
        search: '',
        bannerSuccess: null,
        bannerFail: null,
        isActive: true,
        user: null
      };
    },
    created() {
      axios.get('/users/profiles').then(response => {
        this.users = response.data.rows;
        this.accessDenied = false;
      }).catch(error => {

         // Show Access Denied Error
         if(error.response.status == 403){
            this.accessDenied = true;
         }

      });
    },

    methods:{
        handleEditClicks(user) {

            var reqAdmin = 'true';

            //Check if user privillege can be updated - ie not applying to own user
            axios.get('/auth/success/').then(response => {

                  if(response.data["user_id"] == user.user_id){reqAdmin = 'false';}

                   window.location.assign('/account.html?user_id=' + user.user_id + '&reqAdmin=' + reqAdmin);
              });


          },

        handleDeleteClicks(user) {

          //Show the confirmation dialog
          this.visible = true;

          //Set the user to be deleted
          this.user = user;
        },

          addUser(){
            window.location.assign('/admin-signup.html');
          },

          confirm() {
            // Hide the dialog
            this.visible = false;

            //Delete User
            axios.delete('/auth/remove/' + this.user.user_id).then(response => {

              this.bannerSuccess = 'User Deleted Successfully';

              if(response.data == "User Deleted, Logged Out"){
                window.location.assign('/home.html');
              }

              //Delete user from list
              for(var i = 0; i < this.users.length; i++){
                if(this.users[i].user_id == this.user.user_id){
                  this.users.splice(i, 1);
                }
              }

              //Hide success after 3 seconds
              setTimeout(() => {
                this.bannerSuccess = null;
              }, 3000);


              }).catch(error => {
                this.bannerFail = error.response.data;

                //Hide error after 3 seconds
                setTimeout(() => {
                  this.bannerFail = null;
                }, 3000);
              });

          },
          cancel() {
            // Hide the dialog
            this.visible = false;
          }
    },

    computed:{
        filteredPeople(){

            // If there is no filter text, just return everyone
          if (!this.search || this.search == '') return this.users;

          // Convert the search text to lower case
          let searchText = this.search.toLowerCase();

          // Use the standard javascript filter method of arrays
          // to return only people whose first name or last name
          // includes the search text
          return this.users.filter(p => {

            //Return filtered people
            return p.first_name.toLowerCase().includes(searchText) ||
            p.last_name.toLowerCase().includes(searchText);
          });
        }

      }
  });




  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      //reload page to ensure data is up to date
      location.reload();
    }
  });