let currentGuide = null;
let activeClasses = new Set(['mage', 'archer', 'shaman', 'assassin', 'warrior']); // All classes active by default

// Load guide when page loads
document.addEventListener('DOMContentLoaded', () => {
    const raidSelect = document.getElementById('raid-select');
    const classBtns = document.querySelectorAll('.class-btn');

    // Load the guides list
    fetch('guides/guides-list.json')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load guides list');
            return response.json();
        })
        .then(guidesList => {
            // Populate dropdown
            raidSelect.innerHTML = '';
            
            guidesList.forEach(guide => {
                const option = document.createElement('option');
                option.value = guide;
                option.textContent = guide;
                raidSelect.appendChild(option);
            });
            
            // Load first guide if available
            if (guidesList.length > 0) {
                loadGuide(guidesList[0]);
            }
        })
        .catch(error => {
            console.error('Error loading guides list:', error);
        });
    
    raidSelect.addEventListener('change', () => {
        const selectedRaid = raidSelect.value;
        loadGuide(selectedRaid);
    });
    
    // Setup multi-select class buttons
    classBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const classType = btn.dataset.class;
            
            if (activeClasses.has(classType)) {
                // Remove class from active set
                activeClasses.delete(classType);
                btn.classList.remove('active');
            } else {
                // Add class to active set
                activeClasses.add(classType);
                btn.classList.add('active');
            }
            
            filterTips();
        });
    });
});

function loadGuide(raidId) {
    fetch(`guides/${raidId}.html`)
        .then(response => {
            if (!response.ok) throw new Error('Guide not found');
            return response.text();
        })
        .then(html => {
            document.getElementById('guide-content').innerHTML = html;
            currentGuide = raidId;
            filterTips();
        })
        .catch(error => {
            document.getElementById('guide-content').innerHTML = `
                <div class="loading">
                    <p>❌ Error loading guide: ${error.message}</p>
                </div>
            `;
        });
}

function filterTips() {
    const tips = document.querySelectorAll('.tip');
    
    // If no classes selected, hide all tips
    if (activeClasses.size === 0) {
        tips.forEach(tip => tip.classList.add('hidden'));
        return;
    }
    
    // Show tips for selected classes, hide others
    tips.forEach(tip => {
        let tipClass = null;
        
        // Determine which class this tip belongs to
        if (tip.classList.contains('mage')) tipClass = 'mage';
        else if (tip.classList.contains('archer')) tipClass = 'archer';
        else if (tip.classList.contains('shaman')) tipClass = 'shaman';
        else if (tip.classList.contains('assassin')) tipClass = 'assassin';
        else if (tip.classList.contains('warrior')) tipClass = 'warrior';
        
        // Show tip if its class is in activeClasses set
        if (tipClass && activeClasses.has(tipClass)) {
            tip.classList.remove('hidden');
        } else {
            tip.classList.add('hidden');
        }
    });
}