var util = require('../util/util')

//添加用户
exports.add = function(req, res, body){
    //tin
    // util.info("add user")
    const pool = util.getPool();
    (async () => {
        
        const client = await pool.connect()

        try {
            await client.query('begin')
            const sql = "insert into tb_sys_user(dept_id, nickname, sex, age, pwd, "
                +"account, phone, email,idnumber, address, "
                +"money, integral, head, flag, create_time, "
                +"remark)"
                +"values ($1, $2, $3, $4, $5, "
                +"$6, $7, $8, $9, $10, "
                +"0, 0, $11, '0', now(), "
                +"$12 )";
            const params = [body.deptId, body.nickname, body.sex, body.age, body.pwd, 
                body.account, body.phone, body.email, body.idnumber, body.address, 
                body.head, 
                body.remark]
            await client.query(sql, params)
            await client.query('commit')
            res.end(`{"code":"ok","msg":"添加成功！"}`)

        } catch (e) {
            await client.query('rollback')
            throw e
        } finally {
            client.release()
        }
    })().catch(e =>{
        res.end(`{"code":"error","msg":"添加失败！"}`);
        console.error(e.stack);
    })

}

//添加用户
exports.del = function(req, res, body){
    //tin
    util.info("del user")

    res.end()
}