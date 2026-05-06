// iOS App State
const appState = {
    currentWorkout: 0,
    workouts: [
        { name: 'Chest Day', exercises: ['Bench Press', 'Incline Press', 'Flyes', 'Triceps'] },
        { name: 'Back Day', exercises: ['Deadlift', 'Pull-ups', 'Rows', 'Curls'] }
    ]
};

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    renderWorkouts();
    setupGestures();
    initChart();
});

// Initialize
function initApp() {
    // iOS Safe Areas
    document.documentElement.style.setProperty('--safe-top', '44px');
    
    // Menu Gesture
    document.querySelector('.menu-btn')?.addEventListener('click', toggleMenu);
    
    // Voice (Siri-like)
    document.getElementById('voiceBtn')?.addEventListener('click', startVoice);
}

function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('active');
}

function startWorkout() {
    const workout = appState.workouts[appState.currentWorkout];
    document.getElementById('modalTitle').textContent = workout.name;
    
    document.getElementById('exercisesList').innerHTML = workout.exercises.map(name => `
        <div class="exercise-item">
            <div>
                <strong>${name}</strong>
                <small>4 × 10-12</small>
            </div>
            <div>
                <input class="exercise-input" type="number" placeholder="80">
                <input class="exercise-input" type="number" placeholder="10">
            </div>
        </div>
    `).join('');
    
    document.getElementById('workoutModal').classList.add('active');
}

function logWorkout() {
    // Haptic Feedback (iOS)
    if (window.navigator.vibrate) navigator.vibrate(50);
    
    document.getElementById('workoutModal').classList.remove('active');
    showNotification('✅ Workout Logged!');
    
    // Update rings
    updateRings();
}

function renderWorkouts() {
    document.getElementById('workoutsList').innerHTML = appState.workouts.map((w, i) => `
        <div class="workout-card" onclick="appState.currentWorkout=${i};startWorkout()">
            <div>
                <h3>${w.name}</h3>
                <p>${w.exercises.length} exercises</p>
            </div>
            <i class="fas fa-chevron-right"></i>
        </div>
    `).join('');
}

function updateRings() {
    document.querySelectorAll('.ring').forEach(ring => {
        const progress = ring.dataset.progress;
        const fg = ring.querySelector('.ring-fg');
        fg.style.strokeDashoffset = 100 - (100 * progress / 100);
    });
}

function initChart() {
    const canvas = document.getElementById('progressChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Week 1','Week 2','Week 3','Week 4','Week 5'],
            datasets: [{ label: 'Bench', data: [60,68,75,82,88], borderColor: '#007AFF', tension: 0.4 }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
}

function setupGestures() {
    let startX;
    document.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    document.addEventListener('touchend', e => {
        if (startX < 50) toggleMenu(); // Swipe from left
        startX = null;
    });
}

function startVoice() {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.onresult = e => {
            const command = e.results[0][0].transcript.toLowerCase();
            if (command.includes('workout')) startWorkout();
        };
        recognition.start();
    }
}

function showNotification(msg) {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = msg;
    document.body.appendChild(notif);
    
    setTimeout(() => notif.remove(), 2000);
}

// Add notification style
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(52,199,89,0.95);
        color: white;
        padding: 16px 24px;
        border-radius: 20px;
        font-weight: 600;
        z-index: 10001;
        animation: bounceIn 0.3s;
    }
    @keyframes bounceIn {
        0% { transform: translateX(-50%) translateY(-20px); opacity: 0; }
        100% { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
`;
document.head.appendChild(style);