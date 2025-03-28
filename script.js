document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const minutesDisplay = document.getElementById('minutes');
    const secondsDisplay = document.getElementById('seconds');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const workDurationInput = document.getElementById('work-duration');
    const breakDurationInput = document.getElementById('break-duration');
    const modeIndicator = document.getElementById('mode-indicator');
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const tasksCompletedDisplay = document.getElementById('tasks-completed');
    const alarmSound = document.getElementById('alarm-sound');
    
    // Timer variables
    let timer;
    let timeLeft = 0;
    let isRunning = false;
    let isWorkSession = true;
    let workDuration = parseInt(workDurationInput.value) * 60;
    let breakDuration = parseInt(breakDurationInput.value) * 60;
    let completedPomodoros = 0;
    let tasksCompleted = 0;
    
    // Initialize the app
    init();
    
    function init() {
        // Load tasks from localStorage
        loadTasks();
        
        // Set initial timer display
        updateTimerDisplay(workDuration);
        
        // Event listeners
        startBtn.addEventListener('click', startTimer);
        pauseBtn.addEventListener('click', pauseTimer);
        resetBtn.addEventListener('click', resetTimer);
        workDurationInput.addEventListener('change', updateWorkDuration);
        breakDurationInput.addEventListener('change', updateBreakDuration);
        addTaskBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addTask();
            }
        });
    }
    
    // Timer functions
    function startTimer() {
        if (!isRunning) {
            if (timeLeft === 0) {
                timeLeft = isWorkSession ? workDuration : breakDuration;
            }
            
            timer = setInterval(() => {
                timeLeft--;
                updateTimerDisplay(timeLeft);
                
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    timerComplete();
                }
            }, 1000);
            
            isRunning = true;
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            workDurationInput.disabled = true;
            breakDurationInput.disabled = true;
        }
    }
    
    function pauseTimer() {
        clearInterval(timer);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }
    
    function resetTimer() {
        clearInterval(timer);
        isRunning = false;
        isWorkSession = true;
        timeLeft = workDuration;
        updateTimerDisplay(timeLeft);
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        workDurationInput.disabled = false;
        breakDurationInput.disabled = false;
        modeIndicator.textContent = 'Work Session';
        modeIndicator.className = 'work-mode';
    }
    
    function timerComplete() {
        // Play alarm sound
        alarmSound.play();
        
        // Show notification
        const sessionType = isWorkSession ? 'Work' : 'Break';
        Swal.fire({
            title: `${sessionType} session complete!`,
            text: isWorkSession ? 'Time for a break!' : 'Ready to work again?',
            icon: 'success',
            confirmButtonText: 'OK'
        });
        
        // Toggle session type
        isWorkSession = !isWorkSession;
        timeLeft = isWorkSession ? workDuration : breakDuration;
        updateTimerDisplay(timeLeft);
        
        // Update UI
        if (isWorkSession) {
            modeIndicator.textContent = 'Work Session';
            modeIndicator.className = 'work-mode';
            completedPomodoros++;
        } else {
            modeIndicator.textContent = 'Break Time';
            modeIndicator.className = 'break-mode';
        }
        
        // Automatically start next session if timer was running
        if (isRunning) {
            startTimer();
        }
    }
    
    function updateTimerDisplay(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        
        minutesDisplay.textContent = mins.toString().padStart(2, '0');
        secondsDisplay.textContent = secs.toString().padStart(2, '0');
    }
    
    function updateWorkDuration() {
        workDuration = parseInt(workDurationInput.value) * 60;
        if (!isRunning && isWorkSession) {
            timeLeft = workDuration;
            updateTimerDisplay(timeLeft);
        }
    }
    
    function updateBreakDuration() {
        breakDuration = parseInt(breakDurationInput.value) * 60;
        if (!isRunning && !isWorkSession) {
            timeLeft = breakDuration;
            updateTimerDisplay(timeLeft);
        }
    }
    
    // Task functions
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText) {
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';
            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox">
                <span class="task-text">${taskText}</span>
                <div class="task-actions">
                    <button class="delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            taskList.appendChild(taskItem);
            taskInput.value = '';
            
            // Add event listeners to new task
            const checkbox = taskItem.querySelector('.task-checkbox');
            const deleteBtn = taskItem.querySelector('.delete-btn');
            const taskTextElement = taskItem.querySelector('.task-text');
            
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    taskTextElement.classList.add('completed');
                    taskItem.classList.add('completed');
                    tasksCompleted++;
                    tasksCompletedDisplay.textContent = tasksCompleted;
                } else {
                    taskTextElement.classList.remove('completed');
                    taskItem.classList.remove('completed');
                    tasksCompleted--;
                    tasksCompletedDisplay.textContent = tasksCompleted;
                }
                saveTasks();
            });
            
            deleteBtn.addEventListener('click', function() {
                if (checkbox.checked) {
                    tasksCompleted--;
                    tasksCompletedDisplay.textContent = tasksCompleted;
                }
                taskItem.remove();
                saveTasks();
            });
            
            saveTasks();
        }
    }
    
    function saveTasks() {
        const tasks = [];
        document.querySelectorAll('.task-item').forEach(taskItem => {
            tasks.push({
                text: taskItem.querySelector('.task-text').textContent,
                completed: taskItem.querySelector('.task-checkbox').checked
            });
        });
        
        localStorage.setItem('pomodoroTasks', JSON.stringify(tasks));
        localStorage.setItem('tasksCompleted', tasksCompleted);
    }
    
    function loadTasks() {
        const savedTasks = JSON.parse(localStorage.getItem('pomodoroTasks')) || [];
        const savedCompleted = parseInt(localStorage.getItem('tasksCompleted')) || 0;
        
        tasksCompleted = savedCompleted;
        tasksCompletedDisplay.textContent = tasksCompleted;
        
        savedTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                <div class="task-actions">
                    <button class="delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            taskList.appendChild(taskItem);
            
            // Add event listeners to loaded task
            const checkbox = taskItem.querySelector('.task-checkbox');
            const deleteBtn = taskItem.querySelector('.delete-btn');
            const taskTextElement = taskItem.querySelector('.task-text');
            
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    taskTextElement.classList.add('completed');
                    taskItem.classList.add('completed');
                    tasksCompleted++;
                    tasksCompletedDisplay.textContent = tasksCompleted;
                } else {
                    taskTextElement.classList.remove('completed');
                    taskItem.classList.remove('completed');
                    tasksCompleted--;
                    tasksCompletedDisplay.textContent = tasksCompleted;
                }
                saveTasks();
            });
            
            deleteBtn.addEventListener('click', function() {
                if (checkbox.checked) {
                    tasksCompleted--;
                    tasksCompletedDisplay.textContent = tasksCompleted;
                }
                taskItem.remove();
                saveTasks();
            });
        });
    }
});