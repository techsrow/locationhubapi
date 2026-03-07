export const adminBookingEmail = (booking: any) => {

return `

<div style="background:#f4f4f4;padding:40px;font-family:Arial,Helvetica,sans-serif">

<div style="max-width:700px;margin:auto;background:white;border-radius:6px;overflow:hidden">

<!-- HEADER -->

<div style="background:#5a0f2e;padding:18px;text-align:center">
<img src="https://locationshub.in/images/loaction-hub-logo-final.svg" alt="Locations Hub" style="height:40px"/>
</div>

<!-- TITLE -->

<div style="padding:30px;text-align:center">

<h1 style="margin:0;color:#333;font-weight:600">
New <span style="background:#f3d67b;padding:3px 6px">Booking</span>
</h1>

<p style="color:#666;margin-top:10px">
You have received a booking from <strong>${booking.name}</strong>.
The booking details are below.
</p>

</div>

<hr style="border:none;border-top:1px solid #eee">

<!-- BOOKING DETAILS -->

<div style="padding:30px">

<h2 style="text-align:center;color:#333">
<span style="background:#f3d67b;padding:3px 6px">Booking</span> Details
</h2>

<table style="width:100%;border-collapse:collapse;margin-top:20px">

<tr>
<td style="padding:10px;border-bottom:1px solid #eee;color:#555">
Booking ID
</td>
<td style="padding:10px;border-bottom:1px solid #eee;text-align:right">
${booking.bookingId}
</td>
</tr>

<tr>
<td style="padding:10px;border-bottom:1px solid #eee;color:#555">
Name
</td>
<td style="padding:10px;border-bottom:1px solid #eee;text-align:right">
${booking.name}
</td>
</tr>

<tr>
<td style="padding:10px;border-bottom:1px solid #eee;color:#555">
Booking Date
</td>
<td style="padding:10px;border-bottom:1px solid #eee;text-align:right">
${booking.date}
</td>
</tr>

<tr>
<td style="padding:10px;border-bottom:1px solid #eee;color:#555">
Package
</td>
<td style="padding:10px;border-bottom:1px solid #eee;text-align:right">
${booking.package}
</td>
</tr>

<tr>
<td style="padding:10px;border-bottom:1px solid #eee;color:#555">
Timings
</td>
<td style="padding:10px;border-bottom:1px solid #eee;text-align:right">
${booking.slots}
</td>
</tr>

<tr>
<td style="padding:10px;border-bottom:1px solid #eee;color:#555">
Cost
</td>
<td style="padding:10px;border-bottom:1px solid #eee;text-align:right">
₹${booking.cost}
</td>
</tr>

<tr>
<td style="padding:10px;border-bottom:1px solid #eee;color:#555">
Total
</td>
<td style="padding:10px;border-bottom:1px solid #eee;text-align:right">
₹${booking.total}
</td>
</tr>

<tr>
<td style="padding:10px;border-bottom:1px solid #eee;color:#555">
Payment Method
</td>
<td style="padding:10px;border-bottom:1px solid #eee;text-align:right">
${booking.paymentMethod}
</td>
</tr>

<tr>
<td style="padding:10px;border-bottom:1px solid #eee;color:#555">
Advance Paid (Inc GST)
</td>
<td style="padding:10px;border-bottom:1px solid #eee;text-align:right">
₹${booking.advance}
</td>
</tr>

<tr>
<td style="padding:10px;border-bottom:1px solid #eee;color:#555">
Dues (Excl GST)
</td>
<td style="padding:10px;border-bottom:1px solid #eee;text-align:right">
₹${booking.due}
</td>
</tr>

</table>

</div>

<!-- NOTES -->

<div style="padding:30px;color:#555">

<h3>Please note :</h3>

<ol style="line-height:1.7">

<li>Timings cannot be shifted.</li>

<li>Please reach 20 mins prior for Payment and Booking formalities.</li>

<li>Dues + Deposit (Refundable) to be paid before the shoot.</li>

<li>Please carry your Id Proof.</li>

<li>Outside Food and Beverages are not allowed.</li>

<li>All Sets & Props are on sharing basis, cooperative behavior is expected.</li>

<li>
Download Google location offline before starting.  
<a href="https://maps.app.goo.gl/6pPZoJ6wMU8tsGET6">
Open Map
</a>
</li>

<li>
Locations Hub Manager  
Prashant +91 8169232114
</li>

</ol>

</div>

<hr style="border:none;border-top:1px solid #eee">

<!-- BILLING ADDRESS -->

<div style="padding:30px;text-align:center">

<h2>Billing Address</h2>

<p style="line-height:1.7;color:#555">

${booking.name}<br>
${booking.address}<br>
${booking.city} ${booking.postcode}<br>
${booking.state}<br>

<a href="tel:${booking.phone}">
${booking.phone}
</a>

<br><br>

<a href="mailto:${booking.email}">
${booking.email}
</a>

</p>

</div>

<!-- FOOTER -->

<div style="text-align:center;padding:20px;color:#999">

<p>Copyright © Locations Hub</p>

</div>

</div>

</div>

`;
};