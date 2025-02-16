<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $firstName = htmlspecialchars($_POST['firstName']);
    $lastName = htmlspecialchars($_POST['lastName']);
    $phone = htmlspecialchars($_POST['phone']);
    $email = htmlspecialchars($_POST['email']);
    $address = htmlspecialchars($_POST['address']);
    $newCustomer = htmlspecialchars($_POST['newCustomer']);
    $helpDescription = htmlspecialchars($_POST['helpDescription']);

    // Send email
    $to = "your-email@example.com"; // Replace with your email address
    $subject = "New Contact Us Form Submission";
    $message = "First Name: $firstName\nLast Name: $lastName\nPhone: $phone\nEmail: $email\nAddress: $address\nNew Customer: $newCustomer\nHow can we help you?: $helpDescription";
    $headers = "From: $email";

    if (mail($to, $subject, $message, $headers)) {
        echo "Email sent successfully.";
    } else {
        echo "Failed to send email.";
    }

    // Update Google Sheets
    $url = 'https://sheets.googleapis.com/v4/spreadsheets/YOUR_SPREADSHEET_ID/values/Sheet1!A1:append?valueInputOption=USER_ENTERED';
    $data = [
        'values' => [
            [$firstName, $lastName, $phone, $email, $address, $newCustomer, $helpDescription]
        ]
    ];
    $options = [
        'http' => [
            'header'  => "Content-type: application/json\r\nAuthorization: Bearer YOUR_ACCESS_TOKEN\r\n",
            'method'  => 'POST',
            'content' => json_encode($data),
        ],
    ];
    $context  = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    if ($result === FALSE) {
        echo "Failed to update Google Sheets.";
    } else {
        echo "Google Sheets updated successfully.";
    }
}
?>