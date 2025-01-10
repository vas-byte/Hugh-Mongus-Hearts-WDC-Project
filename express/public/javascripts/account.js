new Vue({
    el: '#account',
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
        bannerSuccess: null,
        bannerFail: null,
        first_name: '',
        last_name: '',
        email: '',
        is_admin: '',
        is_oauth: null,
        req_by_admin: null,
        accountType: '',
        uid: '',
        sending: false,
        organisations: []
      }
    },
    beforeCreate() {
      var urlParams = new URLSearchParams(window.location.search);
      var uid = urlParams.get('user_id') == null ? '' : urlParams.get('user_id');

      axios.get(`/users/profile/${uid}`).then(response => {
        this.first_name = response.data.first_name
        this.last_name = response.data.last_name
        this.email = response.data.email
        this.is_admin = response.data.is_admin
        this.accountType = response.data.is_admin ? "Administrator" : "User";
        this.is_oauth = response.data.is_oauth

        //Determine if request made by different Administrator
        this.req_by_admin = urlParams.get('reqAdmin') == 'true' ? true : false;

        //Set uid for post requests
        this.uid = urlParams.get('user_id') == null ? uid : urlParams.get('user_id');


      }).catch(banner => {

         // Redirect user to login if banner is permissions related
         if(banner.response.status == 403){
            window.location.replace('/login.html')
         }

      });

      //get organisations
      axios.get(`/myOrganisations/${uid}`).then(response => {
        this.organisations = response.data;

      }).catch(error => {

      });
    },

    methods: {

      //Called every time the user clicks the logout button
      logOut(){
        window.location.assign('/auth/logout');
      },

      //Called every time the user clicks yes on the dialog
      confirm() {
        //Hide the dialog
        this.visible = false;

        //Delete the user
        axios.delete(`/auth/remove/${this.uid}`).then(response => {

          this.bannerSuccess = 'User Deleted Successfully';

          if(response.data == "User Deleted"){
            //Redirect to admin page, after 3 seconds
            setTimeout(() => {
              window.location.assign('/admin.html')
            }, 3000);
          }

          if(response.data == "User Deleted, Logged Out"){
            window.location.assign('/home.html')
          }

        }).catch(banner => {

          //show banner for 3 seconds if failed
          this.bannerFail = banner.response.data
          setTimeout(() => {
            this.bannerFail = null
          }, 3000);

        });
      },

      //Called every time the user clicks no on the dialog
      cancel(){
        // Hide the dialog
        this.visible = false;
      },

      sendResetLink(){

        //check if already sending
        if(this.sending){
            return;
        }

        //set sending to true
        this.sending = true;

        // Make Post Request to password reset endpoint
        axios.post(`/auth/reset/`, {
          email: this.email,
          user_id: this.uid
        }).then(response => {

          //show banner for 5 seconds if successful
          this.bannerSuccess = "Reset link sent successfully!"
          setTimeout(() => {
            this.bannerSuccess = null
          }, 3000);

          this.sending = false;

        }).catch(banner => {

          //show banner for 5 seconds if failed
          this.bannerFail = banner.response.data
          setTimeout(() => {
            this.bannerFail = null
          }, 3000);

        });

      },

      deleteUser(){
        //Show the confirmation dialog
        this.visible = true;
      },

      gotoOrganisation(organisation){
        //Redirect to organisation page
        window.location.assign(`/organisations.html?id=${organisation.id}`);
      },

      //Called for every form submission
      updateUser() {

        if(this.first_name == '' || this.last_name == '' || this.email == ''){
            this.bannerFail = "fields cannot be null!"
            setTimeout(() => {
              this.bannerFail = null
            }, 3000);
            return;
        }

        // Make Post Request to password login endpoint
        axios.post(`/users/profile/${this.uid}`, {
          first_name: this.first_name,
          last_name: this.last_name,
          email: this.email,
          is_admin: this.is_admin ? 1 : 0
        }).then(async response => {

            //update notification preferences
            for(var i = 0; i < this.organisations.length; i++){
              await axios.post(`/updateNotifications`, {
                id: this.uid,
                organisation_id: this.organisations[i].id,
                event_notifications: this.organisations[i].event_notifications,
                post_notifications: this.organisations[i].post_notifications
              });
            }

            //show banner for 5 seconds if successful
            this.bannerSuccess = "Profile updated successfully!"
            setTimeout(() => {
              this.bannerSuccess = null
            }, 3000);

        }).catch(banner => {

            //show banner for 5 seconds if failed
            this.bannerFail = "Profile update failed!"
            setTimeout(() => {
              this.bannerFail = null
            }, 3000);

        });
      }
    },
  });
