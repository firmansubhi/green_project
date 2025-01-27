$(function () {
	const token = localStorage.getItem("token");
	$.ajax({
		url: domain + "/auth/test_login",
		beforeSend: function (xhr) {
			xhr.setRequestHeader("Authorization", "Bearer " + token);
		},
		success: function (data) {
			if (data.success) {
				$("#head").load("menu-" + data.role + ".html");
			}
		},
		error: function (xhr, status, error) {
			window.location.href = domain + "/index.html";
		},
		dataType: "json",
	});
});
