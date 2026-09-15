// An object list with slider values and attributes
const checklistItems = [{
	id: "windSpeed",
	label: "Wind Speed (MPH)",
	min: 0,
	max: 20,
	val: 0,
	limit: 12
}, {
	id: "windGust",
	label: "Wind Gust (MPH)",
	min: 0,
	max: 25,
	val: 0,
	limit: 15
}, {
	id: "alcohol",
	label: "Hours Since Last Drink",
	min: 0,
	max: 24,
	val: 24,
	limit: 10,
	invert: true
}, {
	id: "fatigue",
	label: "Hours of Sleep",
	min: 0,
	max: 8,
	val: 8,
	limit: 2,
	invert: true
}];

// Creates HTML varaible with checklist objects
const checklistHTML = checklistItems.map(item => `
    <div class="form-group">
        <div class="label-container">
            <label for="${item.id}">${item.label}</label>
            <span class ="slider-value" id="${item.id}Value">${item.val}</span>
        </div>
        <input id="${item.id}" min=${item.min} max=${item.max} type="range" value=${item.val}>
    </div>
`).join('');

// Injects HTML checklist into HTML page
document.getElementById('formFields').innerHTML = checklistHTML;
// Create a formfield variable
const formField = document.getElementById('formFields');
// Create a status indicator variable
const statusIndicator = document.getElementById('statusIndicator')

// Function to calculate item risk from 0-1
function getItemRisk(item) {
    // Creates a variable that stores the value of the slider
	const val = Number(item.val);
    // Creates a varaibles that stores the limit of the slider
	const limit = Number(item.limit);
    // If then for inverted sliders where a low value is risky
	if (item.invert) {
		// If value is below limit set risk to 1
		if (val < limit) {
			return 1.0;
		}
		// Range variable the items maximum value minus its limit
		const range = item.max - limit;
        // Prevents diviing by zero
		if (range <= 0) return 0;
        // This calculates the risk from a min of 0 to a max of 1
		const risk = (item.max - val) / range;
        // Ensures risk never goes above 1, ensure risk never drops below 0
		return Math.max(0, Math.min(1, risk));
	} else {
		// 🛑 Hard NO-GO: Exceeds safety limit
		if (val > limit) {
			return 1.0;
		}
		// 📈 Smooth Risk: Scale risk up as 'val' approaches 'limit' from below
		return val / limit;
	}
}

function calculateOverallRisk() {
	// Sets risk to 0
    let maxRisk = 0;
    // For loop
	for (const item of checklistItems) {
        // Sets itemRisk to it risk calculed from function getItemRisk
		const itemRisk = getItemRisk(item);
		// Immediate NO-GO threshold
		if (itemRisk >= 1.0) {
			return 1.0;
		}
        // If risk is above 0 but less than 1 it will set maxRisk to item risk
		if (itemRisk > maxRisk) {
			maxRisk = itemRisk;
		}
	}

	return maxRisk;
}
// Adds an event listener to our form field inputs
formFields.addEventListener('input', function(event) {
    // If loop for sliders
	if (event.target.type === 'range') {
        // Grabs the current slider from the event listener event object
		const currentSlider = event.target;
        // Grabs the current slider ID from the event listener event object
		const currentId = currentSlider.id;
        // Grabs the current slider value from the event listener event object
		const currentValue = currentSlider.value;
        // Grabs the current slider display value from the event listener event object
		const displaySpan = document.getElementById(`${currentId}Value`);
        // Sets display value span to slider value
		displaySpan.textContent = currentValue;
		// Do not understand this quite yet
		const item = checklistItems.find(i => i.id === currentId);
		if (item) {
			item.val = currentValue;
		}
		// 3. Evaluate new risk & update color
		const overallRisk = calculateOverallRisk();
        // Smooths out risk color by taking a decimial to a power
		const curvedRisk = Math.pow(overallRisk, 6);
        // Sets hue variable and converts to an HSL value with 120 at its max (green)
		const hue = (1 - curvedRisk) * 120;
        // Sets color of status indicator
		statusIndicator.style.backgroundColor = `hsl(${hue}, 100%, 45%)`;
	}
});