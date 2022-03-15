var dummyData = [
    { title: 'First', detail: 'aaa' },
    { title: 'Second', detail: 'bbb' },
];

var dataSet = [];
var ID;

//!############# Get blog ###################
async function getDataSet() {
    await $.ajax({
        type: "GET",
        url: "/getBlog",
        cache: false,
        dataType: "json",
        success: function (response) {
            dataSet = response;
            console.log(dataSet);
        },
        error: function (xhr) {
            Swal.fire(xhr.responseText);
        }
    });
}

async function callEditModal(id) {
    await getDataSet();
    ID = id;

    $("#inputModal").modal("show");
    $("#newTitle").val(dataSet[id]['title']);
    $("#newDetail").val(dataSet[id]['detail']);
}


$(document).ready(function () {
    //getDataSet();

    // for (var i = 0; i < dummyData.length; i++) {
    //     let postCardTemplate = ` <div class="col-md-6 mt-3" >
    //     <div class="card" id= "cardID_${i}">
    //         <div class="card-body p-4">
    //             <div class="text-strats">
    //                 <h5 class="fw-bolder" id="postTitle">${dummyData[i].title}</h5>
    //                 <p id="postDetail">${dummyData[i].detail}</p>
    //             </div>
    //         </div>
    //         <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
    //             <div class="text-end">
    //                 <a class="btn btn-outline-dark mt-auto btn-edit" id="btnEdit" href="#">Edit</a>
    //                 <a class="btn btn-outline-dark mt-auto btn-delete" href="#">Delete</a>
    //             </div>
    //         </div>
    //     </div>
    // </div>`
    //     $("#postCard").append(postCardTemplate);
    // }

    $('#btnNewPost').click(function () {
        // $("#newPostModal").modal("show");
        // $("#newTitle").val("");
        // $("#newDetail").val("");
    });

    $("#btnEditBlog").click(function () {

        $("#inputModal").modal("hide");
        let newTitle = $("#newTitle").val();
        let newDetail = $("#newDetail").val();

        $.ajax({
            type: "POST",
            url: "/editData",
            data: { ID, $("#newTitle").val(), newDetail },
            success: function (response) {
                window.location.reload();
                console.log(dataSet);
                alert("Success");
            }, error: (xhr) => {
                alert("xhr.responseText");
                // Swal.fire({
                //     icon: 'error',
                //     title: 'ขออภัย',
                //     text: xhr.responseText,
                // })
            }
        });
    });

    // $("#btnSubmitPost").click(function () {
    //     // let newTitle = $("#newTitle").val();
    //     // let newDetail = $("#newDetail").val();

    //     // dummyData.push({ title: newTitle, detail: newDetail });
    //     // $("#newPostModal").modal("hide");
    //     // updateCard();
    // });

    $(".btn-delete").click(function () {
        $.ajax({
            type: "DELETE",
            url: "/post",
            headers: {'authorization': 'Bearer ' + window.localStorage.token},
            success: function (response) {
                
            },error: function(xhr){
                alert("xhr.responseText");
            }
        });
        // var id = this.id;
        // var split_id = id.split("_");
        // var deleteindex = split_id[1];

        // $("#cardID_" + deleteindex).remove();
        // console.log(deleteindex);

    });

    // $(".btn-edit").click(function () {
    //     console.log('hi');


    // });



});