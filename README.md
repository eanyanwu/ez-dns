# Exploration & Implementation of the various components to the Domain Name System

## Intro

The birth of the internet enabled computers to send data to each other. Like houses, each computer (or host) on the internet has an address (now known as an IP address) that identifies it. But wouldn't it be nice if instead of remembering a string of numbers, we could identify hosts more meaningfully? And so the concept of "domain names" was born. 

In the days of old, the mapping of domain name to host IP address was centrally managed:

> Currently hosts in the ARPA Internet are registered with the Network Information Center (NIC) and listed in a global table. The size of this table, and especially the frequency of updates to the table are near the limit of manageability. What is needed is a distributed database that performs the same function, and hence avoids the problems caused by a centralized database.  
~ RFC 882

So handling the frequency of updates was among the core goals of DNS. But that is not all. You can find out more from RFC 1034 Sections 2.1 and 2.2

So what is DNS?  
It's a database that that lets you look up information about domain names.

Uh, and what is a *domain name*?  
It is a string of characters that looks like this: `maps.google.com`

What's up with the dots?  
They help us organize domain names in hierarchical way.  
The domain name `google.com` is a parent of `maps.google.com` and `mail.google.com`. The two "child" domains are called *sub-domains*.  
In fact, it is this hierarchical structure that allows the DNS database to be split up (i.e. distributed) and placed on different computers.

For the system to be useful, there are no restrictions on what information is associated with a domain name. We say a domain name is associated with a set of *resource records.* A resource record has:

- an owner: The domain name that this resource record belongs to.
- a type: This is an identifier for the type of information this resource record has. Some examples are: A, CNAME, MX, and NS.
- a class: odd-ball. For most purposes, you can assume this value is the same. It originates from a time where people thought many types of languages would be spoken on the internet. That has not panned out, as the TCP/IP protocol is basically the only protocol spoken.
- a TTL: This field is primarily used by resolvers to indicate how long they should cache the resource record before it should be discarded.
- the actual data

The two main parts of DNS are:

- A **name server** is a server program that holds information about the domain tree's structure. It has complete information about a subset of the tree, and pointers to other name servers for the rest. A *zone* is the subset of the domain tree that a nameserver has complete information about. The principal activity of name servers is to answer queries. These queries can be answered in either non-recursive mode (mandatory) or recursive mode (optional).
- A **resolver** is a client program used to extract information from name servers in response to user requests.


For background information, look to [rfc 1034](https://www.rfc-editor.org/info/rfc1034),  
For implementation details, start [at rfc 1035](https://www.rfc-editor.org/info/rfc1035)