document.addEventListener('DOMContentLoaded', function() {
    var organisationList = document.querySelector('.organisation-list');

    // Event listener for the organisation list that toggles the button text and class when a button is clicked
    // No longer used. Join button will appear in the organisation page
    organisationList.addEventListener('click', function(event) {
        var button = event.target;
        if (button.tagName.toLowerCase() === 'button') {
            if (button.classList.contains('join-button')) {
                button.textContent = 'JOINED';
                button.classList.remove('join-button');
                button.classList.add('joined-button');
            } else if (button.classList.contains('joined-button')) {
                button.textContent = 'JOIN';
                button.classList.remove('joined-button');
                button.classList.add('join-button');
            }
        }
    });

    // Event listeners for the organisation list that change the button text when the mouse is over a button
    organisationList.addEventListener('mouseover', function(event) {
        var button = event.target;
        if (button.tagName.toLowerCase() === 'button' && button.classList.contains('joined-button')) {
            button.textContent = 'LEAVE';
        }
    });

    // Event listeners for the organisation list that change the button text when the mouse is not over a button
    organisationList.addEventListener('mouseout', function(event) {
        var button = event.target;
        if (button.tagName.toLowerCase() === 'button' && button.classList.contains('joined-button')) {
            button.textContent = 'JOINED';
        }
    });
});

var vueinst = new Vue({
  el: '#app',
  data: {
    user_admin: false,
    organisations: [],
    search: ''
  },

   created() {

    var checkAdmin = new XMLHttpRequest();
    checkAdmin.open("GET", "/admin/", true);
    checkAdmin.onload = function() {
        if (checkAdmin.status >= 200 && checkAdmin.status < 400) {
          this.user_admin = true;
        } else if (xhttp.readyState === 4 && xhttp.status === 403){
          this.user_admin = false;
        }
    }.bind(this);
    checkAdmin.send();

    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/organisation-list", true);
    xhttp.onload = function() {
        if (xhttp.status >= 200 && xhttp.status < 400) {
            this.organisations = JSON.parse(xhttp.responseText);
        }
    }.bind(this);
    xhttp.send();





  },
  methods: {
    deleteOrganisation(organisationName, index) {
      let xhttp = new XMLHttpRequest();

      xhttp.onreadystatechange = function() {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
          this.organisations.splice(index, 1);
          return;
        } else if (xhttp.readyState === 4 && xhttp.status === 403){
          window.location.href = 'organisation-list.html';
          window.alert("Unauthorized Request");
          return;
        }
      }.bind(this);

      xhttp.open("POST", "/admin/deleteOrganisation", true);
      xhttp.setRequestHeader("Content-Type", "application/json");
      xhttp.send(JSON.stringify({
        id: organisationName
      }));
    },

    editOrganisation: function(organisationId) {
      window.location.href = 'edit-organisation.html?id=' + organisationId;
    },

    redirect: function(organisationId) {
      window.location.href = 'organisations.html?id=' + organisationId;
    }
  },

  computed:{
    filterOrganisations(){

      // If there is no filter text, just return everyone
      if (!this.search || this.search == '') return this.organisations;

      // Convert the search text to lower case
      let searchText = this.search.toLowerCase();

      // Use the standard javascript filter method of arrays
      // to return only people whose first name or last name
      // includes the search text
      return this.organisations.filter(p => {

        //Return filtered people
        return p.name.toLowerCase().includes(searchText);
      });
    }

  }
});

