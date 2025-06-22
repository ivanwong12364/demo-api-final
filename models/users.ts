import * as db from '../helpers/database';

export const getAll = async  (limit=10, page=1) =>{
  const offset = (page - 1) * limit;
  const query = "SELECT * FROM users LIMIT  ? OFFSET  ?;";
  const data = await db.run_query(query, [limit, offset]);
  return data;
}

export const getSearch = async  (sfield:any,q:any) =>{
 const query = `SELECT ${sfield} FROM users WHERE ${sfield} LIKE '%${q}%' `;
 try{ const data = await db.run_query(query,null);
  return data;}
  catch(error) {
    return error
}
}

export const getByUserId = async  (id:number) =>{
  let query = "SELECT * FROM users WHERE id = ?"
  let values = [id]
  let data = await db.run_query(query, values)
  return data
}

export const add = async  (user:any) =>{  
  let keys= Object.keys(user)
  let values= Object.values(user)  
  let key = keys.join(',')   
  let parm = ''
  for(let i =0; i<values.length; i++){ parm +='?,'}
  parm=parm.slice(0,-1)
  let query = `INSERT INTO users (${key}) VALUES (${parm})`
  try{
    await db.run_query(query, values)  
    return {"status": 201}
  } catch(error) {
    return error
  }
}

// New function for OAuth users - ensures proper user creation with OAuth fields
export const addOAuthUser = async (user: any) => {
  // Ensure OAuth users always have 'user' role and proper auth provider
  // 注意：這裡的屬性名稱必須與資料庫欄位名稱完全一致
  const oauthUser = {
    ...user,
    role: 'user', // Force user role for OAuth registrations
    auth_provider: user.auth_provider || 'google', // 修改：使用蛇形命名 auth_provider
    password: user.password || '', // Empty password for OAuth users
    passwordsalt: user.passwordsalt || ''
  };
  
  let keys = Object.keys(oauthUser);
  let values = Object.values(oauthUser);
  let key = keys.join(',');
  let parm = '';
  for(let i = 0; i < values.length; i++){ 
    parm += '?,';
  }
  parm = parm.slice(0, -1);
  
  let query = `INSERT INTO users (${key}) VALUES (${parm}) RETURNING *`;
  try {
    const result = await db.run_query(query, values);
    return result[0]; // Return the created user
  } catch(error) {
    console.error('Error creating OAuth user:', error);
    return null;
  }
}

export const findByUsername = async (username: string) => {
  const query = 'SELECT * FROM users where username = ?';
  const user = await db.run_query(query,  [username] );
  return user;
}

// New function to find user by Google ID
export const findByGoogleId = async (googleId: string) => {
  const query = 'SELECT * FROM users WHERE google_id = ?'; // 修改：使用蛇形命名 google_id
  try {
    const user = await db.run_query(query, [googleId]);
    return user;
  } catch(error) {
    console.error('Error finding user by Google ID:', error);
    return [];
  }
}

// New function to find user by email
export const findByEmail = async (email: string) => {
  const query = 'SELECT * FROM users WHERE email = ?';
  try {
    const user = await db.run_query(query, [email]);
    return user;
  } catch(error) {
    console.error('Error finding user by email:', error);
    return [];
  }
}

// New function to link Google account to existing user
export const linkGoogleAccount = async (userId: number, googleId: string) => {
  const query = 'UPDATE users SET google_id = ?, auth_provider = ? WHERE id = ?'; // 修改：使用蛇形命名
  try {
    await db.run_query(query, [googleId, 'google', userId]);
    return { status: 200, message: 'Google account linked successfully' };
  } catch(error) {
    console.error('Error linking Google account:', error);
    return { status: 500, error: 'Failed to link Google account' };
  }
}

export const  update= async(user:any,id:any)  =>{  

  //console.log("user " , user)
 // console.log("id ",id)
  let keys = Object.keys(user)
  let values = Object.values(user)  
  let updateString=""
  for(let i: number = 0; i<values.length;i++){updateString+=keys[i]+"="+"'"+values[i]+"'"+"," }
 updateString= updateString.slice(0, -1)
 // console.log("updateString ", updateString)
  let query = `UPDATE users SET ${updateString} WHERE ID=${id} RETURNING *;`
  try{
   await db.run_query(query, values)  
    return {"status": 201}
  } catch(error) {
    return error
  }
}

export const deleteById = async (id:any) => {
  let query = "Delete FROM users WHERE ID = ?"
  let values = [id]
  try{
    await db.run_query(query, values);  
    return { "affectedRows":1 }
  } catch(error) {
    return error
  }
}

