function sample6_execDaumPostcode() {
  new daum.Postcode({
    oncomplete: function (data) {
      var addr = ""; // 주소 변수

      // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져옵니다.
      if (data.userSelectedType === "R") {
        // 도로명 주소를 선택했을 경우
        addr = data.roadAddress;
      } else {
        // 지번 주소를 선택했을 경우
        addr = data.jibunAddress;
      }

      // 우편번호와 주소 정보를 해당 필드에 넣습니다.
      document.getElementById("sample6_postcode").value = data.zonecode;
      document.getElementById("sample6_address").value = addr;

      // 상세주소 입력 필드로 포커스를 이동합니다.
      document.getElementById("sample6_detailAddress").focus();
    },
  }).open();
}
