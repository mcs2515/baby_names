function pageFunction() {
	let graphDiv = document.querySelector('.chart-div');
	let link = document.querySelector('#link');
	let desc = document.querySelector('.desc');

	$(desc).css('opacity', '0');
	$(desc).css('display', 'none');

	link.onclick = () => {
		graphDiv.classList.toggle('hidden');

		if (graphDiv.classList.contains('hidden')) {

			$(graphDiv).animate({
				'opacity': '0'
			}, 300);

			$(desc).animate({
				'opacity': '1'
			}, 300);

			$(desc).css('display', 'block');

			link.innerHTML = 'Back';

		} else {

			$(graphDiv).animate({
				'opacity': '1'
			}, 300);

			$(desc).animate({
				'opacity': '0'
			}, 300);
			$(desc).css('display', 'none');

			link.innerHTML = 'About';
		}
	}
}