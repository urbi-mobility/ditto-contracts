# Data Flow for the Authentication Protocol
BLOCK-ID is a protocol that allows users to authenticate themselves to multiple, different mobility sharing providers.

BLOCK-ID aims to be a privacy preserving, GDPR compliant identity protocol.

To use BLOCK-ID, users must first validate their identity and driver's license using a Certification Authority (CA). If the validation is successful, the CA emits a digital proof (stored in the Main Ethereum Network) that users can show to prove their identity. Once the validation process is over, the control is in the hands of the user, and the CA removes the personal information of the user from its database.

This document explains how the data is managed, shared, stored, and used across the different parties. The goal is to show how the authentication protocol works. There will be another document in the future to explain how the validation process works. This one is limited to the interaction between the end user and a Shared Mobility Provider.

## Parties Storing Data
The parties storing data are:
- *User*: a generic user of the system.
- *Wallet App*: a BLOCK-ID compatible mobile application, installed in the *User*'s smartphone.
- *Registry*: the smart contract, deployed in the public Main Ethereum Network, where the proofs are stored.
- *Shared Mobility Provider*: a provider of shared vehicles, such as cars, bikes, scooters, etc.

## Data Structure and Proof
What kind of data are we talking about? Something like this:

```
{
  firstName: "Alice",
  lastName: "Cipher",
  nationality: "IT",
  birthDate: "1950-01-22",
  birthCountry: "Italy",
  birthProvince: "MI",
  birthLocality: "Arenzano",
  address: "Via Tasso 11",
  zip: "101010",
  city: "Milano",
  country: "Italy",
  phoneNumber: "003934712345678",
  dlNumber: "AB123",
  dlIssuer: "Motorizzazione civile",
  dlIssueDate: "2010-02-08",
  dlExpirationDate: "2020-02-08",
  dlLevels: {
    B1: true,
    A: true
  },
  nonce: "982157432520684500"
}
```

As you can see, the document contains private identifiable information about the user, including the driver's license number, expiration date (if any) and more. All this information is then hashed and signed by a Certification Authority to provide a verifiable proof, that is then **stored in the Registry**. As we know, hashes are cheap and fast to calculate, and they are practically impossible to revert (i.e. given a hash, it's impossible to reconstruct the data that generated that hash). Reverting a hash is only feasible if the data used to generate the hash is easy to guess. For the private identifiable information just shown, it might be feasible to guess the data (the domain of names, family names, countries, etc. is quite small).

For this reason we added a field called **nonce** (sometimes referred as salt).
In the document there is also field called **nonce**. The **nonce** is a number that is:
- Random, generated using a high entropy source.
- Large enough to make it impossible to guess.
- Secret.

By including the **nonce** in the hashing of the private identifiable information, we make it practically impossible to revert the hash.

## Data Flow for User Authentication
In this section we analyze how the authentication process works from a data perspective. In order to authenticate to a *Mobility Sharing Provider*, a user must have:
- The BLOCK-ID *Wallet App* installed in their smartphone.
- Their identity already validated by a CA.
- At least one *Shared Mobility Provider* App, in order to be able to authenticate somewhere.

At this point in time, the user's personal data is stored locally in the *Wallet App*, and it's only accessible by the user. The *Registry* contains a verifiable proof, that is the hash of the user's data (reverting a hash is mathematically impossible). The hash of the data is digitally signed by a CA, and this information is readeable in the *Registry* itself.

Now the user wants to use the *Wallet App* to register to a *Shared Mobility Provider*. The *Shared Mobility Provider* needs two things to register a user: the user's personal data, and a proof that the user owns a valid driver's license. After user's consent, the *Wallet App* shares with the *Shared Mobility Provider* App the user's data. Now the *Shared Mobility Provider* has the user's personal data and, by calculating the hash of the data, a proof that the data has been vetted by a CA.

By calculating the hash of the data, the *Shared Mobility Provider* is able to **link** the data provided by the User with the data contained in the *Registry*.

After that, the *Shared Mobility Provider* can finally store the user's private information in their database. To avoid further linking to the data contained in the *Registry*, the *Shared Mobility Provider* is requested to forget the **nonce** as soon as the validation is done. Without the nonce, it's impossible to recreate the hash.

Authenticating to a *Shared Mobility Provider*, the user allows the *Wallet App* to share the personal data with a
Once the user decides to authenticate to a *Shared Mobility Provider*,

## To sum up
Given a user that successfully registered to a *Shared Mobility Provider* using the *Wallet App*, the state of the data is the following:
- The private information of the user is stored in the user's smartphone, and it's accessible only to the *Wallet App*. This information is accessible only to the user and it's not public. This information includes the secret **nonce**.
- The *Registry* contains the hash of the private information of the user. It is impossible to revert the hash, unless you have the full data used to generate the hash. This data is publicly accessible.
- The *Shared Mobility Provider* has a copy of the private information of the user. The **nonce**, after being used to validate the signature in the *Registry*, is **not** stored.
