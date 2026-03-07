export const customerBookingEmail = (booking: any) => {

return `
<div style="font-family:Arial;background:#f6f6f6;padding:30px">

<div style="max-width:600px;margin:auto;background:white;border-radius:6px">

<div style="background:#5a0f2e;padding:20px;text-align:center;color:white">
<h2>Locations Hub</h2>
</div>

<div style="padding:30px">

<h2 style="text-align:center">Booking Reminder</h2>

<p>Hello ${booking.firstName}</p>

<p>
This is a reminder that your booking will take place on 
<strong>${booking.date}</strong>
</p>

<table style="width:100%;border-collapse:collapse">

<tr>
<td style="padding:10px;border:1px solid #ddd"><b>Booked Product</b></td>
<td style="padding:10px;border:1px solid #ddd">${booking.product}</td>
</tr>

<tr>
<td style="padding:10px;border:1px solid #ddd"><b>Booking ID</b></td>
<td style="padding:10px;border:1px solid #ddd">${booking.bookingId}</td>
</tr>

<tr>
<td style="padding:10px;border:1px solid #ddd"><b>Booking Date</b></td>
<td style="padding:10px;border:1px solid #ddd">${booking.date}</td>
</tr>

<tr>
<td style="padding:10px;border:1px solid #ddd"><b>Slots</b></td>
<td style="padding:10px;border:1px solid #ddd">${booking.slots}</td>
</tr>

</table>

</div>

<div style="text-align:center;padding:20px;color:#888">
Copyright © Locations Hub
</div>

</div>
</div>
`;
};