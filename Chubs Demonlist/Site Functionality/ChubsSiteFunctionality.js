homeButton.classList.add('clicked');
opinionsButton.classList.remove('clicked');
levelsButton.classList.remove('clicked');
videobox.classList.add('disabled');
statistics.classList.add('disabled');
levelsContainer.classList.add('disabled');
sortbox.classList.add('disabled');
sortselect.classList.add('disabled');
sortbytext.classList.add('disabled');
searchbar.classList.add('disabled');
summarybox.classList.add('disabled')

levelsButton.addEventListener('click', function() {
    levelsButton.classList.add('clicked');
    opinionsButton.classList.remove('clicked');
    homeButton.classList.remove('clicked');
    videobox.classList.remove('disabled');
    statistics.classList.remove('disabled');
    levelsContainer.classList.remove('disabled');
    homecubeimg.classList.add('disabled');
    homeshipimg.classList.add('disabled');
    homeballimg.classList.add('disabled');
    homeufoimg.classList.add('disabled');
    homewaveimg.classList.add('disabled');
    homerobotimg.classList.add('disabled');
    homespiderimg.classList.add('disabled');
    homeswingimg.classList.add('disabled');
    homejetpackimg.classList.add('disabled');
    sortselect.classList.remove('disabled');
    sortbox.classList.remove('disabled');
    sortbytext.classList.remove('disabled');
    searchbar.classList.remove('disabled');
    summarybox.classList.remove('disabled');

});


opinionsButton.addEventListener('click', function() {
    opinionsButton.classList.add('clicked');
    levelsButton.classList.remove('clicked');
    homeButton.classList.remove('clicked');
    videobox.classList.add('disabled');
    statistics.classList.add('disabled');
    levelsContainer.classList.add('disabled');
    homecubeimg.classList.add('disabled');
    homeshipimg.classList.add('disabled');
    homeballimg.classList.add('disabled');
    homeufoimg.classList.add('disabled');
    homewaveimg.classList.add('disabled');
    homerobotimg.classList.add('disabled');
    homespiderimg.classList.add('disabled');
    homeswingimg.classList.add('disabled');
    homejetpackimg.classList.add('disabled');
    sortselect.classList.add('disabled');
    sortbox.classList.add('disabled');
    sortbytext.classList.add('disabled');
    searchbar.classList.add('disabled');
    summarybox.classList.add('disabled');
});

homeButton.addEventListener('click', function() {
    homeButton.classList.add('clicked');
    opinionsButton.classList.remove('clicked');
    levelsButton.classList.remove('clicked');
    videobox.classList.add('disabled');
    statistics.classList.add('disabled');
    levelsContainer.classList.add('disabled');
    homecubeimg.classList.remove('disabled');
    homeshipimg.classList.remove('disabled');
    homeballimg.classList.remove('disabled');
    homeufoimg.classList.remove('disabled');
    homewaveimg.classList.remove('disabled');
    homerobotimg.classList.remove('disabled');
    homespiderimg.classList.remove('disabled');
    homeswingimg.classList.remove('disabled');
    homejetpackimg.classList.remove('disabled');
    sortselect.classList.add('disabled');
    sortbox.classList.add('disabled');
    sortbytext.classList.add('disabled');
    searchbar.classList.add('disabled');
    summarybox.classList.add('disabled');
});

levelrank.classList.addEventListener('click', function() {
    levelrank.classList.add('clicked')
})