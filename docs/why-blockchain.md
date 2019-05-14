# Why Blockchain?
In April 2018, the World Economic Forum released the report [Blockchain Beyond the Hype—A Practical Framework for Business Leaders](https://www.weforum.org/whitepapers/blockchain-beyond-the-hype). The report provides a *decision tree* "to enable rapid initial analysis of whether blockchain is an appropriate solution for a defined problem". The 11 questions (and answers) in the decision tree are the following.

**Are you trying to remove intermediaries or brokers?**<br />
Yes. As we write in the problem statement, today's data is centralized in few identity verification platforms.

**Are you working with digital assets (versus physical assets)**<br />
Yes. The digital asset is the certification that you can drive a vehicle (a.k.a. driving license).

**Can you create a permanent authoritative record of the digital asset inquestion?**<br />
Yes, once a driving license has been validated, it might take up to 10 years to expire. There are other events that can occur in the meantime: a driving license is lost/stolen, or voided. Depending on the infrastructure provided by the Official Identity Registry, this information can be obtained immediately or with some delay. In any case, the responsibility of the Certification Authority is to update the record in the smart contract.

**Do you require high performance, rapid (~millisecond) transactions?**<br />
No. The process to validate a driving license and go through KYC of the user takes minutes. Once the process is done, we don't care if the process of registering the driving license in the blockchain takes few seconds or few minutes.

**Do you intend to store large amounts of non-transactional data as part of your solution?**<br />
No. For each registration, we estimate the amount of data stored to be less than 160 bytes.

**Do you want/need to rely on a trusted party? (e.g., for compliance or liability reasons)**<br />
No. The system is designed to work across Europe (or even beyond it), and it needs to rely on **multiple** trusted parties/governments, specifically multiple Official Identity Registries.

**Are you managing contractual relationships or value exchange?**<br />
Yes. The value is being able to validate the driving license of a user.

**Do you require shared write access?**<br />
Yes. The system allows multiple Certification Authorities to write data in the same smart contract.

**Do contributors know and trust each other?**<br />
No. Certification Authorities don't need to trust each other.

**Do you need to be able to control functionality?**<br />
No. Anyone can become a Certification Authority. But not everyone trusts all Certification Authorities.

**Should transactions be public?**<br />
Yes. All proof and signatures are public.

## Is it safe?
**Data stored in the blockchain is :100:% public. How can you preserve users' privacy while storing things in the public?**

Thanks for your question. The decentralized registry stores only the hash of the user's private information, and it's mathematically unfeasible to revert a hash.

