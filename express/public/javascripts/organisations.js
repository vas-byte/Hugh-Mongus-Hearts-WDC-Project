function selectTab(button){
  const announcementsBtn = document.querySelector("#infoSelector button:nth-child(1)");
  const upcomingBtn = document.querySelector("#infoSelector button:nth-child(2)");
  const membersBtn = document.querySelector("#infoSelector button:nth-child(3)");

  const announcementsDiv = document.getElementById("Announcements");
  const upcomingDiv = document.getElementById("Events");
  const membersDiv = document.getElementById("Members");

  const infoSelector = document.getElementById("infoSelector");

  if (button == announcementsBtn){
    makeVisible(announcementsDiv);
    setActiveButton(announcementsBtn);
    makeHidden(upcomingDiv);
    makeHidden(membersDiv);
  } else if ( button == upcomingBtn){
    makeVisible(upcomingDiv);
    setActiveButton(upcomingBtn);
    makeHidden(announcementsDiv);
    makeHidden(membersDiv);
  } else {
      makeVisible(membersDiv);
      setActiveButton(membersBtn);
      makeHidden(upcomingDiv);
      makeHidden(announcementsDiv);
  }

  window.scrollTo({
    top: infoSelector.offsetTop - 20,
    behavior: 'smooth'
    });
}

// Function to toggle visibility of a div
function makeVisible(div) {
    div.style.display = "block";
}
function makeHidden(div) {
    div.style.display = "none";
}

// Function to set active button style
function setActiveButton(activeBtn) {
    const buttons = document.querySelectorAll("#infoSelector button");
    buttons.forEach(function(btn) {
        btn.classList.remove("activeButton");
        btn.classList.add("passiveButton");
    });
    activeBtn.classList.remove("passiveButton");
    activeBtn.classList.add("activeButton");
}

var vueinst = new Vue({
  el: '#app',
  data: {
    organisationId: 0,
    is_loading: 5,
    user_manager: false,
    user_member: false,
    user_admin: false,
    is_member: 0,
    organisation: [],
    posts: [],
    events: [],
    members: [],
    user_info: [],
    attendees: [],
    show_button: true,
    logged_in: false,
    openModal: false
  },
  // add a method to add a new announcement
  methods: {
    addEvent() {
      window.location.href = '/edit-event.html?postId=' + '&organisationId=' + this.organisationId;
    },

    addPost() {
      // Redirect to edit-post.html with blank post ID and organisation ID
      window.location.href = '/edit-post.html?eventId=' + '&organisationId=' + this.organisationId;
    },

    eventJoinLeave(eventId, index) {
      var xhttp = new XMLHttpRequest();
      xhttp.open("GET", "/event-going/" + eventId, true);
      xhttp.onload = function() {
          if (xhttp.status >= 200 && xhttp.status < 400) {
              var response = JSON.parse(xhttp.responseText);
              if (response.going === 1) {
                this.events[index].is_attending = 1;
                this.events[index].num_attendees++;
              } else if (response.going === 0){
                this.events[index].is_attending = 0;
                this.events[index].num_attendees--;
              }
          } else if (xhttp.readyState == 4 && xhttp.status == 401){
            window.location.href = '/login.html';
          }
      }.bind(this);
      xhttp.send();
    },


    deleteEvent(eventId, index) {
      let xhttp = new XMLHttpRequest();

      xhttp.onreadystatechange = function() {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
          this.events.splice(index, 1);
        }
      }.bind(this);

      xhttp.open("POST", "/manager/deleteEvent", true);
      xhttp.setRequestHeader("Content-Type", "application/json");
      xhttp.send(JSON.stringify({
        id: eventId,
        organisation_id: this.organisationId
      }));
    },

    deletePost(postId, index) {
      let xhttp = new XMLHttpRequest();

      xhttp.onreadystatechange = function() {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
          this.posts.splice(index, 1);
        }
      }.bind(this);

      xhttp.open("POST", "/manager/deletePost", true);
      xhttp.setRequestHeader("Content-Type", "application/json");
      xhttp.send(JSON.stringify({
        id: postId,
        organisation_id: this.organisationId
      }));
    },

    editPost(postId) {
      window.location.href = '/edit-post.html?postId=' + postId + '&organisationId=' + this.organisationId;
    },

    editEvent(eventId) {
      window.location.href = '/edit-event.html?eventId=' + eventId + '&organisationId=' + this.organisationId;
    },

    formatDate(date) {
      if (!date) return '';

      // Create a new Date object
      var d = new Date(date);

      // Format the date
      var day = d.getDate();
      var month = d.getMonth() + 1; // Months are zero based
      var year = d.getFullYear();

      // Return the formatted date
      return day + '/' +month + '/' + year;
    },

    join(){
      let xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            this.user_member = true;
            this.refreshMembers();
            return;
        } else if (xhttp.readyState === 4 && xhttp.status === 401){
            window.location.href = '/login.html';
            return;
        } else if (xhttp.readyState === 4){
          this.user_member = false;
          this.refreshMembers();
          return;
        }
      }.bind(this);
      xhttp.open("POST", "/joinOrganisation", true);
      xhttp.setRequestHeader("Content-Type", "application/json");
      xhttp.send(JSON.stringify({
        organisation_id: this.organisationId
      }));


    },

    leave(){
      let xhttp = new XMLHttpRequest();

      xhttp.onreadystatechange = function() {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
          this.user_member = false;
          this.refreshMembers();
          return;
        } else if (xhttp.readyState === 4 && xhttp.status === 401){
          window.location.href = '/login.html';
          return;
        } else if (xhttp.readyState === 4){
          this.user_member = true;
          this.refreshMembers();
          return;
        }
      }.bind(this);
      xhttp.open("POST", "/leaveOrganisation", true);
      xhttp.setRequestHeader("Content-Type", "application/json");
      xhttp.send(JSON.stringify({
        organisation_id: this.organisationId,
      }));


    },
    refreshMembers(){
      var members = new XMLHttpRequest();
      members.open("GET", "/members-list?organisationId=" + this.organisationId, true);
      members.onload = function() {
          if (members.status >= 200 && members.status < 400) {
              this.members = JSON.parse(members.responseText);
          }
      }.bind(this);
      members.send();
    },

    makeManager(memberId, isManager, isAdmin){
      let xhttp = new XMLHttpRequest();
      if (isAdmin) return;
      if(isManager){
        xhttp.onreadystatechange = function() {
          if (xhttp.readyState === 4 && xhttp.status === 200) {
            this.refreshMembers();
            return;
          }
        }.bind(this);
        xhttp.open("POST", "/manager/removeManager", true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(JSON.stringify({
          organisation_id: this.organisationId,
          user_id: memberId
        }));
      } else {

        xhttp.onreadystatechange = function() {
          if (xhttp.readyState === 4 && xhttp.status === 200) {
            this.refreshMembers();
            return;
          }
        }.bind(this);
        xhttp.open("POST", "/manager/makeManager", true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(JSON.stringify({
          organisation_id: this.organisationId,
          user_id: memberId
        }));
      }
    },

    deleteMember(memberId){
      let xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
          this.refreshMembers();
          return;
        }
      }.bind(this);
      xhttp.open("POST", "/manager/deleteMember", true);
      xhttp.setRequestHeader("Content-Type", "application/json");
      xhttp.send(JSON.stringify({
        organisation_id: this.organisationId,
        user_id: memberId
      }));
    },
    formatTimeDateString(dateString) {
      const date = new Date(dateString);

      // Options for date formatting in UTC
      const dateOptions = {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'UTC'
      };

      // Options for time formatting in UTC
      const timeOptions = {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'UTC'
      };

      // Format date and time
      const formattedDate = date.toLocaleDateString(undefined, dateOptions);
      const formattedTime = date.toLocaleTimeString(undefined, timeOptions);

      return `${formattedDate} at ${formattedTime}`;
    },

    getAttendees(eventId) {

      this.attendees = [];
      let xhttp = new XMLHttpRequest();
      xhttp.open("GET", "/attendees-list/" + eventId, true);
      xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
          this.attendees = JSON.parse(xhttp.responseText);
          this.openModal = true;

        }
      };
      xhttp.send();
    }
  },

  created() {
    // Get the organisation ID from the URL
    var urlParams = new URLSearchParams(window.location.search);
    this.organisationId = urlParams.get('id');

    // Send a request to the server to get the organisation information
    var organisation = new XMLHttpRequest();
    organisation.open("GET", '/organisation/' + this.organisationId, true);
    organisation.onload = function() {
      if (organisation.status >= 200 && organisation.status < 400) {
          this.organisation = JSON.parse(organisation.responseText);
          this.is_loading--;
          if (this.organisation.is_manager == 1){
            this.user_manager = true;
            this.user_member = true;
          } else if (this.organisation.is_manager == 0){
            this.user_manager = false;
            this.user_member = true;
          } else {
            this.user_manager = false;
            this.user_member = false;
          }
        }
      }.bind(this);
      organisation.send();

    // get user_info
    var user = new XMLHttpRequest();
    user.open("GET", "/auth/success", true);
    user.onload = function() {
        if (user.status >= 200 && user.status < 400) {
          this.user_info = JSON.parse(user.responseText);
          this.user_admin = (this.user_info.is_admin == 1);
          this.logged_in = true;
          this.is_loading--;
        } else if (user.readyState == 4){
          this.user_admin = 0;
          this.logged_in = false;
          this.is_loading--;
        }
    }.bind(this);
    user.send();

    // get posts
    var posts = new XMLHttpRequest();
    posts.open("GET", "/posts-list?organisationId=" + this.organisationId, true);
    posts.onload = function() {
        if (posts.status >= 200 && posts.status < 400) {
            this.posts = JSON.parse(posts.responseText);
            this.is_loading--;
        }
    }.bind(this);
    posts.send();

    // get events
    var events = new XMLHttpRequest();
    events.open("GET", "/events-list?organisationId=" + this.organisationId, true);
    events.onload = function() {
        if (events.status >= 200 && events.status < 400) {
            this.events = JSON.parse(events.responseText);
            this.is_loading--;
        }
    }.bind(this);
    events.send();

    // get members
    var members = new XMLHttpRequest();
    members.open("GET", "/members-list?organisationId=" + this.organisationId, true);
    members.onload = function() {
        if (members.status >= 200 && members.status < 400) {
            this.members = JSON.parse(members.responseText);
            this.is_loading--;
        }
    }.bind(this);
    members.send();
  }
});
