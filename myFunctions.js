$(document).ready(function () {
  const detailToggles = $('input[name="showd"]');
  detailToggles.on('change', function(event) {
    const nextRow = $(event.target).closest('tr').next();
    if (nextRow.length) {
      nextRow.toggle($(event.target).prop('checked'));
    }
  });

  const mealCheckboxes = $('input[type="checkbox"].meal-select');
  const followButton = $("#follow");
  let selectedMeals = JSON.parse(localStorage.getItem("selectedMeals") || "[]");
  let formValidated = localStorage.getItem("formValidated") === "true";

  function saveSelectedMeals() {
    localStorage.setItem("selectedMeals", JSON.stringify(selectedMeals));
    updateOrderSummary();
  }

  function updateSelectedMeals() {
    selectedMeals = mealCheckboxes.filter(':checked').map(function() {
      return {
        code: $(this).data("code"),
        name: $(this).data("name"),
        price: $(this).data("price")
      };
    }).get();
    saveSelectedMeals();
  }

  function updateOrderSummary() {
    const summary = $("#orderSummary");
    if (summary.length === 0) return;
    
    if (!formValidated) {
      summary.html("<p>يرجى ملء البيانات والتحقق منها لعرض الوجبات المختارة.</p>");
      followButton.prop('disabled', false);
      return;
    }
    
    if (selectedMeals.length === 0) {
      summary.html("<p>لم يتم اختيار أي وجبة حتى الآن.</p>");
      followButton.prop('disabled', true);
      return;
    }
    followButton.prop('disabled', false);
    const listItems = selectedMeals.map(meal =>
      `<li><strong>${meal.code}</strong> - ${meal.name} - ${meal.price}</li>`
    ).join("");
    summary.html(`
      <h3>الوجبات المختارة</h3>
      <ul>${listItems}</ul>
    `);
  }

  mealCheckboxes.each(function() {
    const stored = selectedMeals.find(meal => meal.code === $(this).data("code"));
    if (stored) {
      $(this).prop('checked', true);
    }
  });
  
  mealCheckboxes.on('change', updateSelectedMeals);

  updateSelectedMeals();
});

const goBack = () => {
  window.history.back();
}

function toggleForm() {
  var form = $("#myinfo");
  if (form.is(":hidden")) {
    form.show();
  } else {
    form.hide();
    localStorage.removeItem("formValidated");
    location.reload();
  }
}

function validateForm() {
  var number_s = $("#number_s").val().trim();
  var date1 = $("#date1").val().trim();
  var phone = $("#phonenumber").val().trim();
  var username = $("#myUsername").val().trim();

 
  var numberPattern = /^\d{6}$/;
  if (number_s === "" || !numberPattern.test(number_s)) {
    alert("يرجى إدخال رقم حساب بنكي صالح مؤلف من 6 ارقام");
    return false;
  }

  if (username !== "") {
    var usernamePattern = /^[A-Za-z\s]+$/;
    if (!usernamePattern.test(username)) {
      alert("الرجاء إدخال الاسم باللغة الانجليزية بدون أرقام أو رموز");
      return false;
    }
  }


  if (date1 !== "") {
    var datePattern = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
    if (!datePattern.test(date1)) {
      alert("يرجى إدخال تاريخ الطلب صالح بتنسيق MM/DD/YYYY");
      return false;
    }
  }


  if (phone !== "") {
    var phonePattern = /^(0(93|94|95|96|98|99|92|97)[0-9]{7})$/;
    if (!phonePattern.test(phone)) {
      alert("يرجى إدخال رقم هاتف صالح مع رمز البلد (مثال: 0991400700)");
      return false;
    }
  }

  var mealCheckboxes = $('input[type="checkbox"].meal-select');
  var selected = mealCheckboxes.filter(':checked');
  if (selected.length === 0) {
    alert("يرجى اختيار وجبة واحدة على الأقل من الجدول قبل المتابعة");
    return false;
  }

  localStorage.setItem("selectedMeals", JSON.stringify(selected.map(function() {
    return {
      code: $(this).data("code"),
      name: $(this).data("name"),
      price: $(this).data("price")
    };
  }).get()));
  localStorage.setItem("formValidated", "true");

  displayConfirmedOrder(selected);
  return false;
}

function displayConfirmedOrder(selectedCheckboxes) {
  const confirmArea = $("#confirmation");
  if (confirmArea.length === 0) return;
  const userName = $("#myUsername").val().trim();
  
  // حساب المبلغ الإجمالي
  let totalAmount = 0;
  const orderList = selectedCheckboxes.map(function() {
    const price = $(this).data("price");
    const priceNumber = parseFloat(price.replace(/[^\d.]/g, ''));
    totalAmount += priceNumber;
    return `
      <tr>
        <td>${$(this).data("code")}</td>
        <td>${$(this).data("name")}</td>
        <td>${price}</td>
      </tr>
    `;
  }).get().join("");
  
  // حساب الخصم 5%
  const discount = totalAmount * 0.05;
  const finalAmount = totalAmount - discount;
  
  confirmArea.html(`
    <div class="modal-overlay" id="orderModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>تم تأكيد الطلب</h2>
          <span class="close-modal" onclick="closeOrderModal()">&times;</span>
        </div>
        <div class="modal-body">
          <div class="order-info">
            <p><strong>اسم العميل: </strong>${userName || "غير محدد"}</p>
          </div>
          <div class="order-items">
            <h3>البيانات المختارة</h3>
            <table class="order-table">
              <thead>
                <tr>
                  <th>الرمز</th>
                  <th>الوجبة</th>
                  <th>السعر</th>
                </tr>
              </thead>
              <tbody>
                ${orderList}
              </tbody>
            </table>
          </div>
          <div class="order-summary">
            <div class="summary-row">
              <span>المبلغ الإجمالي:</span>
              <span class="amount">${totalAmount.toFixed(2)} ل.س</span>
            </div>
            <div class="summary-row discount">
              <span>الخصم (5%):</span>
              <span class="discount-amount">-${discount.toFixed(2)} ل.س</span>
            </div>
            <div class="summary-row total">
              <span>المبلغ النهائي:</span>
              <span class="final-amount">${finalAmount.toFixed(2)} ل.س</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-confirm" onclick="confirmOrder()">تأكيد الطلب</button>
          <button class="btn-cancel" onclick="closeOrderModal()">إلغاء</button>
        </div>
      </div>
    </div>
  `);
}

function closeOrderModal() {
  $("#orderModal").fadeOut(300, function() {
    $(this).remove();
  });
}

function confirmOrder() {
  alert("تم تأكيد الطلب بنجاح!");
  closeOrderModal();
}
