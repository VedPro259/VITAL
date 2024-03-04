let date;
let count = 0; 
let userDates = []; 
var socket = io(); 
let currentLine = '';
let dia; 
let sys; 
let hr; 
let spo2; 
document.querySelector('.wbv-range').disabled = true; 
const canvas = document.getElementById('myChart');
const ctx = canvas.getContext('2d');
let myChart = new Chart(ctx, {
  type: 'line',
  data: {
     labels: [],
     datasets: [
       { label: 'HR', data: [], borderColor: 'rgba(255, 99, 132, 1)' },
       { label: 'DIA', data: [], borderColor: 'rgba(54, 162, 235, 1)' },
       { label: 'SYS', data: [], borderColor: 'rgba(255, 206, 86, 1)' },
       { label: 'O2', data: [], borderColor: 'rgba(75, 192, 192, 1)' }
     ]
  },
  options: {
     responsive: true,
     animation: false, 
     scales: {
       x: {
         type: 'linear',
         position: 'bottom'
       }
     },
     plugins: {
       title: {
         display: true,
         text: 'Heart Rate, Diastolic, Systolic, Oxygen Levels'
       }
     }
  }
});

function bpStage(sys, dia) {
  let str = ' You may have to consult a medical professional for a more accurate diagnosis.'
  if (sys > 180 || dia > 120) {
    return 'may have hypertensive crisis.' + str; 
  } else if (sys >= 140 || dia >= 90) {
    return 'may have stage II hypertension.' + str;
  } else if ((130 <= sys && sys <= 139) || (80 <= dia && dia <= 89)) {
    return 'may have stage I hypertension.' + str; 
  } else if ((120 <= sys && sys <= 129) && dia < 80) {
    return 'may have elevated blood pressure.' + str; 
  } else if ((sys >= 90 && sys < 120) && (dia >= 60 && dia < 80)) {
    return 'have normal blood pressure.'
  } else if (sys < 90 || dia < 60) {
    return 'may have low blood pressure (hypotension). However, what is considered low blood pressure for one person might be okay for someone else.' + str; 
  }
}

function updateChart() {
  if (myChart.data.datasets[0].data.length > 200) {
    //send to database first
    myChart.data.datasets[0].data = []; 
    myChart.data.datasets[1].data = []; 
    myChart.data.datasets[2].data = []; 
    myChart.data.datasets[3].data = []; 
    myChart.data.labels = []; 
    console.log('hello'); 
  }
  myChart.data.labels.push(myChart.data.labels.length); 
  myChart.update();
  
} 

function getDate() {
  date = new Date()
  date = date[Symbol.toPrimitive]('string');
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

function disableButton(param) {
  const button = document.querySelector(param);
  button.disabled = true;
  setTimeout(function() {
    button.disabled = false;
  }, 3000);
}

//event delegation 
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
          userDates[i] = '?'; 
          document.querySelector('.checking').innerHTML = "Removed!"; 
        }
      }
    }
  }
});

function checkReminders() {
  for (let i = 0; i < userDates.length; i++) {
    if (date.startsWith(userDates[i])) {
      document.querySelector('.the-paragraph').style.padding = '5px'; 
      document.querySelector('.the-paragraph').innerHTML = `Reminder for ${userDates[i]} `; 
      document.querySelectorAll(`.date-${i}`).forEach(value => { 
        value.remove(); 
      })
      userDates[i] = '?'; 
      //write alert in here  
      if (date.startsWith("Sun")) {
        socket.emit('toggleLed', '1'); 
      } else if (date.startsWith("M")) {
        socket.emit('toggleLed', '2'); 
      } else if (date.startsWith("Tue")) {
        socket.emit('toggleLed', '3'); 
      } else if (date.startsWith("Wed")) {
        socket.emit('toggleLed', '4');
      } else if (date.startsWith("Th")) {
        socket.emit('toggleLed', '5'); 
      } else if (date.startsWith("Fr")) {
        socket.emit('toggleLed', '6');
      } else if (date.startsWith("Sa")) {
        socket.emit('toggleLed', '7');
      } else {
        console.log('error'); 
      }
    }
  };
}

var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); 
var yyyy = today.getFullYear();
today = yyyy + '-' + mm + '-' + dd;
document.getElementById("myDate").setAttribute('min', today);

setInterval(getDate, 1000); 
setInterval(checkReminders, 1000); 

document.querySelector('.clear')
  .addEventListener('click', () => {
    userDates = []; 
    document.querySelector('.registered-dates')
      .innerHTML = ''; 
    count = 0; 
    document.querySelector('.checking').innerHTML = "Cleared!"
    socket.emit('toggleLed', '0'); 
  });

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
      document.querySelector('.registered-dates').innerHTML += `<p class="date-${count} registered-date">- ${document.querySelector('.pill-name').value + ' ' + userDates[count] }</p>`; 
      count++
    }
    disableButton('.submit');
  });    

document.addEventListener('DOMContentLoaded', () => {
  const socket = io('http://localhost:3500');
  socket.on('ledStatus', (data) => {
    currentLine = data; 
    if (!currentLine.startsWith('sys')) {
      document.querySelector('.check-calibration')
        .innerHTML = currentLine; 
      console.log(currentLine); 
    } else {
      const splitQuote = currentLine.split(', ');
      sys = Number(splitQuote[0].split(' = ')[1]);
      dia = Number(splitQuote[1].split(' = ')[1]);
      hr = Number(splitQuote[2].split(' = ')[1]);
      spo2 = Number(splitQuote[3].split(' = ')[1]);
      if (hr !== 0) {
        document.querySelector('.heartrate')
          .innerHTML = hr; 
        myChart.data.datasets[0].data.push(hr);
        updateChart(); 
      } else {
        document.querySelector('.heartrate')
          .innerHTML = '--'; 
      }
      if (sys !== 0) {
        document.querySelector('.systolic')
          .innerHTML = sys;
        myChart.data.datasets[2].data.push(sys);  
      } else {
        document.querySelector('.systolic')
          .innerHTML = '--'; 
      }
      if (dia !== 0) {
        document.querySelector('.diastolic')
          .innerHTML = dia; 
          myChart.data.datasets[1].data.push(dia);  
      } else {
        document.querySelector('.diastolic')
          .innerHTML = '--'; 
      }
      if (spo2 !== 0) {
        document.querySelector('.oxygen')
          .innerHTML = spo2; 
        myChart.data.datasets[3].data.push(spo2); 
      } else {
        document.querySelector('.oxygen')
          .innerHTML = '--'; 
      }
    }
    currentLine = '';
  });
});

function displayStage() {
  if (sys && dia) {
    console.log('hi'); 
    document.querySelector('.bp-paragraph').innerHTML = `You ${bpStage(sys, dia)}`; 
  }  
}
document.querySelector('.diastolic').addEventListener('click', displayStage); 
document.querySelector('.systolic').addEventListener('click', displayStage); 
document.querySelector('.oxygen').addEventListener('click', () => {
  if (spo2 >= 95) {
    document.querySelector('.oxygen-paragraph').innerHTML = 'Your SpO2 levels are normal.'
  } else if (spo2 < 95) {
    document.querySelector('.oxygen-paragraph').innerHTML = 'Your SpO2 levels are below average. Please consult with a medical professional.'
  }
});
document.querySelector('.heartrate').addEventListener('click', () => {
  if (hr > 200) {
    document.querySelector('.heart-paragraph').innerHTML = 'Your heart rate is dangerously high. Please consult with a medical professional.'; 
  } else if (hr > 100) {
    document.querySelector('.heart-paragraph').innerHTML = 'Your heart rate shows that you are undergoing intense physical activity. If not, this means your resting heartbeat is above average. Please consult with a medical professional. '
  } else if (hr <= 100) {
    document.querySelector('.heart-paragraph').innerHTML = 'Your resting heart rate is normal.'
  }
});
document.querySelector('.the-paragraph').addEventListener('click', () => {
  document.querySelector('.the-paragraph').innerHTML = ''; 
  document.querySelector('.the-paragraph').style.padding = '0px'; 
  socket.emit('toggleLed', '0'); 
});
document.getElementById('myCheckbox').addEventListener('change', function() {
  if (this.checked) {
    socket.emit('toggleLed', '8'); 
    document.querySelector('.wbv-range').disabled = false; 
  } else {
    socket.emit('toggleLed', '9'); 
    document.querySelector('.wbv-range').disabled = true; 
  }
  disableButton('.myCheckbox'); 
});

document.querySelector('.wbv-range').addEventListener('change', () => {
  const range = document.querySelector('.wbv-range'); 
  if (range.value >= 84) {
    socket.emit('toggleLed', 'd'); 
  } else if (range.value >= 67) {
    socket.emit('toggleLed', 'c');  
  } else if (range.value >= 34) {
    socket.emit('toggleLed', 'b'); 
  } else if (range.value >= 1) {
    socket.emit('toggleLed', 'a'); 
  }; 
  disableButton('.wbv-range'); 
})
//clear box after submit 
// document.querySelector('.calendar')
//   .addEventListener('change', () => {
//   });
// document.querySelector('.time-input')
//   .addEventListener('change', () => {
//   });
//7, 15 58, 89, 90, 107, 108
//7, 13, 107, 58 