module.exports = exports = function(app) {
    exports.app = app
    return exports
}

function formatRow(row) {
    return {
        id: row.user_id,
        admin: row.admin,
        primary: row.primary,
        canTrade: row.can_trade,
        canDeposit: row.can_deposit,
        canWithdraw: row.can_withdraw,
        suspended: row.suspended,
        tfaSecret: row.two_factor,
        tfaPassed: false,
        level: row.security_level,
        key: row.api_key_id
    }
}

exports.fromEmail = function(email, cb) {
    exports.app.conn.read.query({
        text: [
            'SELECT',
            '   a.user_id,',
            '   a.api_key_id,',
            '   u.admin,',
            '   u.security_level,',
            '   u.two_factor,',
            '   u.suspended,',
            '   a.primary,',
            '   a.can_withdraw,',
            '   a.can_deposit,',
            '   a.can_trade',
            'FROM api_key a',
            'INNER JOIN user_view u ON u.user_id = a.user_id',
            'WHERE u.email_lower = $1 AND a.primary = TRUE'
        ].join('\n'),
        values: [email.toLowerCase()]
    }, function(err, dr) {
        if (err) return cb(err)
        if (!dr.rowCount) return cb()
        cb(null, formatRow(dr.rows[0]))
    })
}

exports.fromKey = function(key, cb) {
    exports.app.conn.read.query({
        text: [
            'SELECT',
            '   a.user_id,',
            '   a.api_key_id,',
            '   u.admin,',
            '   u.security_level,',
            '   u.two_factor,',
            '   u.suspended,',
            '   a.primary,',
            '   a.can_withdraw,',
            '   a.can_deposit,',
            '   a.can_trade',
            'FROM api_key a',
            'INNER JOIN user_view u ON u.user_id = a.user_id',
            'WHERE a.api_key_id = $1 AND a.primary = FALSE'
        ].join('\n'),
        values: [key]
    }, function(err, dr) {
        if (err) return cb(err)
        if (!dr.rowCount) return cb()
        cb(null, formatRow(dr.rows[0]))
    })
}
