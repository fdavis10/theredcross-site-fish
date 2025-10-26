document.addEventListener('DOMContentLoaded', function () {
    const activityDonateBtn = document.getElementById('activity-donate-btn');
    if (activityDonateBtn) {
        activityDonateBtn.addEventListener('click', function (e) {
            e.preventDefault();
            const modalEl = document.getElementById('donationModal');
            if (modalEl) {
                const modal = new bootstrap.Modal(modalEl);
                modal.show();
            } else {
                console.error('donationModal не найден на странице');
            }
        });
    }
});