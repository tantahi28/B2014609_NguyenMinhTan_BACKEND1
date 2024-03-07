const { ObjectId } = require("mongodb");

class ContactService {
  constructor(client) {
    this.Contact = client.db().collection("contacts");
  }

  extractContactData(payload) {
    const contact = {
      name: payload.name,
      email: payload.email,
      address: payload.address,
      phone: payload.phone,
      favorite: payload.favorite,
    };

    // Remove undefined fields
    Object.keys(contact).forEach((key) => contact[key] === undefined && delete contact[key]);

    return contact;
  }

  async create(payload) {
    try {
      const contact = this.extractContactData(payload);
      const result = await this.Contact.findOneAndUpdate(
        // Điều kiện xác định bản ghi (ở đây mình sử dụng email làm điều kiện, bạn có thể thay đổi tùy theo nhu cầu)
        { email: contact.email }, 
        { $set: { ...contact, favorite: contact.favorite === true } },
        { returnDocument: "after", upsert: true }
      );

      return result;
    } catch (error) {
      throw new Error("An error occurred while creating the contact");
    }
  }

  async find(filter) {
    const cursor = await this.Contact.find(filter);
    return await cursor.toArray();
  }

  async findByName(name) {
    return await this.find({
      name: { $regex: new RegExp(name), $options: "i" },
    });
  }

  async findById(id) {
    return await this.Contact.findOne({
         _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async update(id, payload) {
    const filter = {
        _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = this.extractContactData(payload);
    const result = await this.Contact.findOneAndUpdate(
        filter,
        { $set: update },
        { returnDocument: "after" }
    );
    console.log(result)
    return result;
  }

  async delete(id) {
    const result = await this.Contact.findOneAndDelete({
        _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  async deleteAll() {
    const result = await this.Contact.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = ContactService;
