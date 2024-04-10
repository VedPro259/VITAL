var socket = io('http://192.168.1.92:3500');
let userDates = []; 
let nam; 
let count = 0; 
const audio = new Audio("https://audio.jukehost.co.uk/zHB3AW4TEeJVg9ufaZMIzm10lF3iVdcr");

socket.on("connection");
socket.on("connect", () => {
  nam = socket.id;  
});

const canvas = document.getElementById('myChart');
const ctx = canvas.getContext('2d');
let myChart = new Chart(ctx, {
 type: 'line',
 data: {
     labels: [],
     datasets: [
       { 
         label: 'PPG', 
         data: [], 
         borderColor: 'rgba(0, 0, 0, 1)', // Line color
         backgroundColor: 'rgba(0, 0, 0, 0.1)' // Fill color under the line
       }
     ]
 },
 options: {
     responsive: true,
     animation: false, 
     scales: {
       x: {
         type: 'linear',
         position: 'bottom',
         ticks: {
           color: 'rgba(0, 0, 0, 1)' // Tick color
         }
       },
       y: {
         ticks: {
           color: 'rgba(0, 0, 0, 1)' // Tick color
         }
       }
     },
     plugins: {
       title: {
         display: true,
         text: 'Heart Rate, Diastolic, Systolic, Oxygen Levels',
         color: 'rgba(0, 0, 0, 1)' // Title color
       },
       legend: {
         labels: {
           color: 'rgba(0, 0, 0, 1)' // Legend text color
         }
       }
     }
 }
});

function disableButton(value) {
  const button = document.querySelector(value);
  button.disabled = true;
  setTimeout(function() {
    button.disabled = false;
  }, 3000);
};

function sendMessage() {
  let messageData = {
    senderName: nam, 
    text: document.querySelector('.message').value
  };
  socket.emit('message', messageData); 
  disableButton('.submit-for-chat'); 
};

function formatDate(input) {
  var parts = input.split('-');
  var date = new Date();
  date.setFullYear(parts[0]);
  date.setMonth(parseInt(parts[1], 10) - 1); 
  date.setDate(parts[2]);
  var dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var dayName = dayNames[date.getDay()];
  var monthName = monthNames[date.getMonth()];
  var day = String(date.getDate()).padStart(2, '0');
  var formattedDate = `${dayName} ${monthName} ${day} ${date.getFullYear()}`;
  return formattedDate;
} 

function updateChart() {
  if (myChart.data.datasets[0].data.length > 200) {
    myChart.data.datasets[0].data = []; 
    myChart.data.labels = []; 
  }
  myChart.data.labels.push(myChart.data.labels.length); 
  myChart.update();
  
};

socket.on('remov', data => {
  //data is the count
  if (data === "Heartbeat detected") {
    document.querySelector('.check-flatlining').style.color = 'black'; 
    document.querySelector('.check-flatlining').innerHTML = data; 
  } else if (data === "Flatlining detected") {
    document.querySelector('.check-flatlining').innerHTML = data;
    document.querySelector('.check-flatlining').style.color = 'red'; 
  } else if (data === -1) {
    document.querySelector('.registered-dates')
      .innerHTML = ''; 
  } else if (document.querySelector(`.date-${data}`)) {
    document.querySelector(`.date-${data}`).remove(); 
  }
});

socket.on('metrics', data => {
  document.querySelector('.diastolic').innerHTML = data.dia; 
  document.querySelector('.systolic').innerHTML = data.sys; 
  document.querySelector('.heartrate').innerHTML = data.hr; 
  document.querySelector('.oxygen').innerHTML = data.spo2; 
  myChart.data.datasets[0].data.push(data.ppg); 
  updateChart(); 
})

socket.on("message", data => {
  if (data.senderName.startsWith(nam)) {
    document.querySelector('.texts').innerHTML += `<p style="color: green; margin-bottom: -10px; font-size: 17px;">${data.text}</p>`; 
  } else {
    document.querySelector('.texts').innerHTML += `<p style="text-align: right; margin-bottom: -10px; font-size: 17px;">${data.text}</p>`; 
    audio.play(); 
  }
});

socket.on("medication", data => {
  if (typeof(data) === 'object') {
    userDates = data.userDates; 
    count = data.count; 
  } else if (typeof(data) === 'string') {
    let phrase = data.slice(13); 
    if (phrase.includes(',') && phrase.includes(':')) {
      let doodoo = phrase.split(/, /); 
      let boo = doodoo[1].split(' ');
      let haha = boo.slice(1, 4).join(' ');
      let yooo = boo[4]; 
      document.querySelector('.table').innerHTML += `<tr>
        <td style="background-color: #ffc4c4;"></td>
        <td>${doodoo[0]}</td>
        <td>${haha}</td>
        <td>${yooo}</td>
      </tr>`; 
    } else if (phrase.includes(':')) {
      let doodoo = phrase.split(" ");
      const jingie = doodoo.slice(0, 4).join(" "); 
      const rollie = doodoo.slice(4).join(" ");
      document.querySelector('.table').innerHTML += `<tr>
        <td style="background-color: #ffc4c4;"></td>
        <td></td>
        <td>${jingie}</td>
        <td>${rollie}</td>
      </tr>`; 
    } else if (phrase.includes(',')) {
      let doodoo = phrase.split(', ');
      document.querySelector('.table').innerHTML += `<tr>
        <td style="background-color: #ffc4c4;"></td>
        <td>${doodoo[0]}</td>
        <td>${doodoo[1]}</td>
        <td></td>
      </tr>`;
    } else {
      document.querySelector('.table').innerHTML += `<tr>
        <td style="background-color: #ffc4c4;"></td>
        <td></td>
        <td>${phrase}</td>
        <td></td>
      </tr>`;
    }
  }
});

document.body.addEventListener('click', function(e) {
  if (e.target.classList.contains('registered-date')) {
    const clickedElement = e.target.closest('.registered-date');
    //loop through all the date-[i]
    //remove that one
    //replace userDates[i] with ?
    for (let i = 0; i < userDates.length; i++) {
      if (document.querySelector(`.date-${i}`)) {
        let thing = document.querySelector(`.date-${i}`); 
        if (thing.innerHTML === clickedElement.innerHTML) {
          thing.remove(); 
          socket.emit('remov', i); 
          userDates[i] = '?'; 
          document.querySelector('.checking').innerHTML = "Removed!"; 
          socket.emit('medication', { userDates, count }); 
        }
      }
    }
  }
});

document.querySelector('.submit-for-chat').addEventListener('click', () => {
  sendMessage(); 
});

document.querySelector('.submit')
  .addEventListener('click', (e) => {
    e.preventDefault(); 
    let messageData = {
      dateValue: document.querySelector('.calendar').value, 
      timeValue: document.querySelector('.time-input').value, 
      pillName: document.querySelector('.pill-name').value
    }; 
    let dateValue = document.querySelector('.calendar').value
    dateValue = formatDate(dateValue) + ' ' + document.querySelector('.time-input').value; 
    for (let i = 0; i < userDates.length; i++) {
      if (userDates[i] === dateValue) {
        document.querySelector('.checking').innerHTML = 'Please do not add the same date twice.';
        return;
      }
    }
    if (dateValue.includes('undefined') || dateValue.includes('NaN')) {
      document.querySelector('.checking').innerHTML = 'Please enter proper credentials'; 
    } else {  
      console.log(userDates);    
      userDates.push( dateValue );
      
      document.querySelector('.checking').innerHTML = 'Logged!'; 
      let coolBeans; 
      if (document.querySelector('.pill-name').value) {
        coolBeans = document.querySelector('.pill-name').value + ', '
      } else {
        coolBeans = '';
      }
      document.querySelector('.registered-dates').innerHTML += `<p class="date-${count} registered-date">${coolBeans + userDates[count] }</p>`; 
      count++
      socket.emit('setDates', messageData); 
    }
    disableButton('.submit');
  });
  
/*
document.querySelector('.submit')
  .addEventListener('click', (e) => {
    e.preventDefault(); 
    let dateValue = document.querySelector('.calendar').value
    dateValue = formatDate(dateValue) + ' ' + document.querySelector('.time-input').value; 
    for (let i = 0; i < userDates.length; i++) {
      if (userDates[i] === dateValue) {
        document.querySelector('.checking').innerHTML = 'Please do not add the same date twice.';
        return;
      }
    }
    if (dateValue.includes('undefined') || dateValue.includes('NaN')) {
      document.querySelector('.checking').innerHTML = 'Please enter proper credentials'; 
    } else {     
      userDates.push( dateValue );
      console.log(userDates); 
      document.querySelector('.checking').innerHTML = 'Logged!'; 
      document.querySelector('.registered-dates').innerHTML += `<p class="date-${count} registered-date">${document.querySelector('.pill-name').value + ' ' + userDates[count] }</p>`; 
      count++
    }
    disableButton('.submit');
  });   
*/ 