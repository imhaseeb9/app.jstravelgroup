export const permissionGroups = [
    {
        label: 'User Management',
        permissions: [
            { name: 'user.view',             label: 'View Users' },
            { name: 'user.create',           label: 'Create Users' },
            { name: 'user.edit',             label: 'Edit Users' },
            { name: 'user.delete',           label: 'Delete Users' },
            { name: 'user.reset_password',   label: 'Reset Password' },
            { name: 'user.view_activity',    label: 'View Activity Logs' },
            { name: 'user.agent_management', label: 'Agent Management' },
        ]
    },
    {
        label: 'Flight Search',
        permissions: [
            { name: 'flight.search',           label: 'Search Flights' },
            { name: 'flight.search_sabre',     label: 'Search via Sabre' },
            { name: 'flight.search_galileo',   label: 'Search via Galileo' },
            { name: 'flight.search_pia',       label: 'Search PIA' },
            { name: 'flight.search_airarabia', label: 'Search Air Arabia' },
            { name: 'flight.search_slamair',   label: 'Search Slam Air' },
            { name: 'flight.view_fare_rules',  label: 'View Fare Rules' },
        ]
    },
    {
        label: 'Booking Management',
        permissions: [
            { name: 'booking.create',    label: 'Create Booking' },
            { name: 'booking.view_own',  label: 'View Own Bookings' },
            { name: 'booking.view_all',  label: 'View All Bookings' },
            { name: 'booking.view_team', label: 'View Team Bookings' },
            { name: 'booking.cancel',    label: 'Cancel Booking' },
            { name: 'booking.modify',    label: 'Modify Booking' },
            { name: 'booking.hold',      label: 'Hold Booking' },
            { name: 'booking.download',  label: 'Download Booking' },
        ]
    },
    {
        label: 'Ticketing',
        permissions: [
            { name: 'ticketing.sabre.issue',     label: 'Issue Sabre Ticket' },
            { name: 'ticketing.galileo.issue',   label: 'Issue Galileo Ticket' },
            { name: 'ticketing.pia.issue',       label: 'Issue PIA Ticket' },
            { name: 'ticketing.airarabia.issue', label: 'Issue Air Arabia Ticket' },
            { name: 'ticketing.slamair.issue',   label: 'Issue Slam Air Ticket' },
            { name: 'ticketing.void_request',    label: 'Request Void' },
            { name: 'ticketing.refund_request',  label: 'Request Refund' },
            { name: 'ticketing.reissue_request', label: 'Request Reissue' },
        ]
    },
    {
        label: 'Finance',
        permissions: [
            { name: 'finance.set_credit_limit',        label: 'Set Credit Limit' },
            { name: 'finance.set_commission',          label: 'Set Commission' },
            { name: 'finance.approve_payment',         label: 'Approve Payment' },
            { name: 'finance.approve_void_request',    label: 'Approve Void' },
            { name: 'finance.approve_refund_request',  label: 'Approve Refund' },
            { name: 'finance.approve_reissue_request', label: 'Approve Reissue' },
            { name: 'finance.view_invoices',           label: 'View Invoices' },
        ]
    },
    {
        label: 'Pricing & Markup',
        permissions: [
            { name: 'pricing.view',   label: 'View Pricing Rules' },
            { name: 'pricing.create', label: 'Create Pricing Rules' },
            { name: 'pricing.edit',   label: 'Edit Pricing Rules' },
            { name: 'pricing.delete', label: 'Delete Pricing Rules' },
        ]
    },
    {
        label: 'CMS',
        permissions: [
            { name: 'cms.view',   label: 'View CMS' },
            { name: 'cms.create', label: 'Create Content' },
            { name: 'cms.edit',   label: 'Edit Content' },
            { name: 'cms.delete', label: 'Delete Content' },
        ]
    },
    {
        label: 'Group Tickets',
        permissions: [
            { name: 'group_ticket.view',   label: 'View Tickets' },
            { name: 'group_ticket.create', label: 'Create Tickets' },
            { name: 'group_ticket.edit',   label: 'Edit Tickets' },
            { name: 'group_ticket.delete', label: 'Delete Tickets' },
            { name: 'group_ticket.book',   label: 'Book Tickets' },
        ]
    },
    {
        label: 'Reports',
        permissions: [
            { name: 'reports.sales',     label: 'Sales Reports' },
            { name: 'reports.booking',   label: 'Booking Reports' },
            { name: 'reports.financial', label: 'Financial Reports' },
            { name: 'reports.agent',     label: 'Agent Reports' },
            { name: 'reports.export',    label: 'Export Reports' },
        ]
    },
    {
        label: 'Settings',
        permissions: [
            { name: 'settings.view',    label: 'View Settings' },
            { name: 'settings.gds',     label: 'GDS Settings' },
            { name: 'settings.airline', label: 'Airline Settings' },
            { name: 'settings.email',   label: 'Email Settings' },
            { name: 'settings.payment', label: 'Payment Settings' },
        ]
    },
    {
        label: 'Inquiries',
        permissions: [
            { name: 'inquiry.view',    label: 'View Inquiries' },
            { name: 'inquiry.respond', label: 'Respond to Inquiries' },
            { name: 'inquiry.create',  label: 'Create Inquiry' },
        ]
    },
]